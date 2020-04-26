import {Request, Response, NextFunction } from "express";

import { AbilityBuilder, Ability } from "@casl/ability";
import { VerifyRole } from "../middlewares/VerifyRole";
import { any } from "bluebird";
const veryfyRole = new VerifyRole();
export class AccessAbility{
    public secondMethod(){
       console.log('asdfasdf');
     }
    public defineAbilitiesFor(user:any) {
        console.log("asdf");
        //   const { rules, can } = AbilityBuilder.extract();
        const { can, cannot, rules } = new AbilityBuilder();
        // can('read', ['Post', 'Comment'])
        //   can('read', [ 'Comment']);
          // can('read', [ 'Post']);
          // can('read', ['Post']);
        //   can(['create','read'], 'User');
          // can('create', 'Post');
          // console.log(user);
 
          console.log("veryfyRolew");
          // if(veryfyRole.isAdmin)
          if (user) {
              console.log("ggwp");
              console.log(user);
            console.log(user._id);
            console.log("user._id");
            // can(['read','create', 'delete', 'update'], ['Post','Comment'], { author: user._id });
            // can([ 'update'], 'User', { id: user.id });
            can([ 'read'], 'Post', { id: user.id });
          }

          return new Ability(rules);
          // return rules;

    }

    // public ANONYMOUS_ABILITY = this.defineAbilitiesFor(null);

    public createAbilities= async (req: any, res: Response, next: NextFunction)=>{
        // console.log(this.secondMethod());
        // console.log(this.secondMethod);
        console.log("lala");
        console.log(veryfyRole.isAdmin(req,res,next));
        console.log("ok");
 
        if(req.user.role)
        req.ability = req.user.email ? this.defineAbilitiesFor(req.user) : "this.ANONYMOUS_ABILITY";
        next();
    };
}
// module.exports.createAbilities=
