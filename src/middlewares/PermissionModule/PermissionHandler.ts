/**
 * Generate authorization models from User, Role, Permission data and
 * provide hooks into authorization module
 */
import { AccessControl as Authorizer, Permission as AuthPermission, Query as AuthQuery } from "accesscontrol";
import cache from "../../utils/cache/Cache"; // Redis commands
import {Logger} from "../../utils/logger";

import { event, EventType } from "./ActivityHelper";

import { getRepository, Repository } from "typeorm";
import { User } from "../../entities/User";
import { Role } from "../../entities/Role";
import { Permission } from "../../entities/Permission";

/**
 * Keys for cache
 */
const RESOURCE: string = "permission";
const AUTHORIZATION_GRANTS_KEY = "authorization:grants";
const USER_ROLES_KEY = (userId: string) => `user:${userId}:roles`;

/**
 * Action types for deciding which query method to execute
 * read[Own|Any], create[Own|Any], update[Own|Any], delete[Own|Any]
 */
enum AuthorizationActions {
  READ = "read",
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
}
const logger = new Logger(__filename);

/**
 * Builds JSON grant list from database roles and permissions
 */
const createGrantListFromDatabase = async (): Promise<Array<{[key: string]: any}>> => {
  logger.info(`Created new grant list from database`);
  const grantList: Array<{[key: string]: any}> = [];
  const roleRepository: Repository<Role> = getRepository(Role);
  const roles: Role[] = await roleRepository.find({ relations: ["permissions"] });

  roles.forEach((role: Role) => {
    role.permissions.forEach((permission: Permission) => {
      const permObj: {[key: string]: any} = {
        action: permission.action,
        attributes: permission.attributes,
        resource: permission.resource,
        role: role.id.toString(),
      };
      grantList.push(permObj);
    });
  });
  logger.info(`Info: ${JSON.stringify(grantList)}`);
  // logger.debug(grantList);
  return grantList;
};

/**
 * Saves grant list object to cache
 * @param grantList
 */
const saveGrantListToCache = async (grantList: {[key: string]: any}): Promise<boolean> => {
  logger.info(`Saving grant list to cache with key ${AUTHORIZATION_GRANTS_KEY}`);
  return await cache.set(AUTHORIZATION_GRANTS_KEY, JSON.stringify(grantList)) !== null;
};

/**
 * Returns global JSON grant list object if found
 */
const getGrantListFromCache = async (): Promise<Array<{[key: string]: any}>> => {
  const grantsString = await cache.get(AUTHORIZATION_GRANTS_KEY);
  return JSON.parse(grantsString);
};

/**
 * Deletes global grants list from cache
 */
const removeGrantListFromCache = async (): Promise<boolean> => {
  logger.info(`Removing grant list from cache with key ${AUTHORIZATION_GRANTS_KEY}`);
  return await cache.del(AUTHORIZATION_GRANTS_KEY) === 1;
};

/**
 * Fetches latest role permissions from database and updates cache
 */
const refreshGrants = async (): Promise<boolean> => {
  const newGrantList: {[key: string]: any} = await createGrantListFromDatabase();
  return saveGrantListToCache(newGrantList);
};

/**
 * Returns array of role strings for given user ID from database
 * @param user
 */
const getUserRolesFromDatabase = async (user: User): Promise<string[]> => {
  const roles: string[] = [];
  
  const userRepository: Repository<User> = getRepository(User);
  const foundUser: User = await userRepository.findOne(user.id, { relations: ["roles"] });
  foundUser.roles.forEach((role: Role) => roles.push(role.id.toString()));
  console.log("apkk")
  logger.debug(`Returning database roles for user id ${user.id}`);
  return roles;
};

/**
 * Adds roles to cache for a given user ID
 * @param user
 * @param token
 */
const addUserRolesToCache = async (user: User, roles: string[]): Promise<boolean> => {
  return await cache.set(USER_ROLES_KEY(user.id.toString()), JSON.stringify(roles)) !== null;
};

/**
 * Returns array of role strings for a given user ID from cache
 * @param user
 */
const getUserRolesFromCache = async (user: User): Promise<string[]> => {
  const rolesString: string = await cache.get(USER_ROLES_KEY(user.id.toString()));
  return JSON.parse(rolesString);
};

/**
 * Removes roles from cache for given user
 * @param user
 * @param roles
 */
const removeUserRolesFromCache = async (user: User): Promise<boolean> => {
  return await cache.del(USER_ROLES_KEY(user.id.toString())) === 1;
};

/**
 * Returns array of role strings for given user ID either from cache or database
 * @param user
 */
const getUserRoles = async (user: User): Promise<string[]> => {
  const started: number = Date.now();
  const rolesInCache: string[] = await getUserRolesFromCache(user);
  // const rolesInCache: string[] = false;
  console.log("aaac");
  console.log(user);
  if (rolesInCache && rolesInCache.length > 0) {
    // log(EventType.CACHE_HIT, USER_ROLES_KEY(user.id.toString()), started);
    console.log("rolesincache");
    console.log(rolesInCache);
    return rolesInCache;
  } else {
    const rolesFromDatabase: string[] = await getUserRolesFromDatabase(user);
    addUserRolesToCache(user, rolesFromDatabase);
    log(EventType.CACHE_MISS, USER_ROLES_KEY(user.id.toString()), started);
    return rolesFromDatabase;
  }
};

/**
 * Updates user roles cache from current database values
 * @param user
 */
const refreshUserRoles = async (user: User): Promise<boolean> => {
  const rolesFromDatabase: string[] = await getUserRolesFromDatabase(user);
  return addUserRolesToCache(user, rolesFromDatabase);
};

/**
 * Checks whether user is authorized
 */
const getAuthorizer = async (): Promise<Authorizer> => {
  const started: number = Date.now();
  
  let grantList: Array<{[key: string]: any}> = await getGrantListFromCache();
  // let grantList: Array<{[key: string]: any}> = false;
  console.log(grantList)
  console.log("grantList")
  if (!grantList) {
    await refreshGrants();
    grantList = await createGrantListFromDatabase();
    log(EventType.CACHE_MISS, AUTHORIZATION_GRANTS_KEY, started);
  } else {
    log(EventType.CACHE_HIT, AUTHORIZATION_GRANTS_KEY, started);
  }
  // let grantList = [
  //   { role: 'admin', resource: 'video', action: 'create:any', attributes: '*, !views' },
  //   { role: 'admin', resource: 'video', action: 'read:any', attributes: '*' },
  //   { role: 'admin', resource: 'video', action: 'update:any', attributes: '*, !views' },
  //   { role: 'admin', resource: 'video', action: 'delete:any', attributes: '*' },
 
  //   { role: 'basic', resource: 'video', action: 'create:own', attributes: '*, !rating, !views' },
  //   { role: 'basic', resource: 'video', action: 'read:own', attributes: '*' },
  //   { role: 'basic', resource: 'video', action: 'update:any', attributes: '*, email' },
  //   { role: 'basic', resource: 'video', action: 'delete:own', attributes: '*' }
  // ];
  console.log(grantList)
  console.log("asdfgrantList")
  return new Authorizer(grantList);
  // return new Authorizer(grantList);
};

/**
 * Returns Permission to check for grants and filter results
 * Methods to use on returned object:
 *  - .granted <boolean> true or false if permission granted
 *  - .filter(Object) <Object[filtered]> optionally filter results for ABAC
 * @param user
 * @param isOwnerOrMember
 * @param action
 * @param resource
 */
const getPermission = async (
        user: User,
        isOwnerOrMember: boolean,
        action: string,
        resource: string): Promise<AuthPermission> => {
  console.log("asdfasdf")
  const authorizer: Authorizer = await getAuthorizer();
  console.log("authorizer")
  console.log(authorizer)
  const userRoles: string[] = await getUserRoles(user);
  console.log(userRoles);
  console.log("userRoles");
  console.log(resource)
  console.log("resource")
  const query: AuthQuery = authorizer.can(userRoles);

  if (isOwnerOrMember) {
    switch (action) {
      case AuthorizationActions.CREATE:
        return query.createOwn(resource);
      case AuthorizationActions.UPDATE:
        return query.updateOwn(resource);
      case AuthorizationActions.DELETE:
        return query.deleteOwn(resource);
      case AuthorizationActions.READ:
        return query.readOwn(resource);
      default:
        return null; // throw Exception?
    }
  } else {
    switch (action) {
      case AuthorizationActions.CREATE:
        return query.createAny(resource);
      case AuthorizationActions.UPDATE:
        return query.updateAny(resource);
      case AuthorizationActions.DELETE:
        return query.deleteAny(resource);
      case AuthorizationActions.READ:
        return query.readAny(resource);
      default:
        return null; // throw Exception?
    }
  }
};

/**
 * Emits event for cache hit/miss tracking
 */
const log = (type: EventType, key: string, started: number) => {
  const ended: number = Date.now();

  event.emit(type, {
    key,
    resource: RESOURCE,
    timestamp: ended,
    took: ended - started,
    type,
  });
};

export {
  AuthPermission,
  AuthorizationActions,
  getUserRoles,
  refreshUserRoles,
  getUserRolesFromDatabase,
  getUserRolesFromCache,
  addUserRolesToCache,
  removeUserRolesFromCache,
  createGrantListFromDatabase,
  saveGrantListToCache,
  getGrantListFromCache,
  removeGrantListFromCache,
  refreshGrants,
  getAuthorizer,
  getPermission,
};
