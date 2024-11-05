import db from "@repo/db/client"
import bcrypt from "bcrypt"

import Credentials from "next-auth/providers/credentials"

export const authOptions={
    providers:[
        Credentials({
            name:'Credentials',
            credentials:{
                phone:{label:"Phone number", type:"text", placeholder:"9876543210"},
                password:{label:"Password", type:"password"}
            },
            async authorize(credentials:any){
                const hashedPassword=await bcrypt.hash(credentials.password,10)
                const existingUser=await db.user.findFirst({
                    where:{
                        number:credentials.phone
                    }
                });

                if(existingUser){
                    const passwordValidation=await bcrypt.compare(credentials.password,existingUser.password)
                    if(passwordValidation){
                        return {
                            id:existingUser.id.totring(),
                            name:existingUser.name,
                            email:existingUser.number
                        }
                    }
                    return null
                }

                try{
                    const user=await db.user.create({
                        data:{
                            number:credentials.phone,
                            password:hashedPassword
                        }
                    });

                    return {
                        id:user.id.totring(),
                        name:user.name,
                        email:user.email
                    }
                }
                catch(err){
                    console.log(err);
                }
                return null;
            },
        })
    ],
    secret:process.env.JWT_SECRET||"secret",
    callbacks:{
        async session({token,session}:any){
            session.user.id=token.sub

            return session
        }
    }
}