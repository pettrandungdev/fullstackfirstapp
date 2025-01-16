import { where } from "sequelize";
import db from "../models/index"
import bcrypt from 'bcryptjs';
import { raw } from "body-parser";
import { canTreatArrayAsAnd } from "sequelize/lib/utils";
import { hashUserPassword } from '../services/CRUDservice';
const salt = bcrypt.genSaltSync(10);

let handleUserLogin = (email, password) => {
    return new Promise(async (resolve, reject) => {
        try {
            let userData = {};
            let isExist = await checkUserEmail(email);
            if (isExist) {
                //check already email exist
                let user = await db.User.findOne({
                    attributes: ['email', 'roleId', 'password'],
                    where: { email: email },
                    raw: true,
                })
                if (user) {
                    //compare password
                    let check = bcrypt.compareSync(password, user.password)
                    if (check) {
                        userData.errCode = 0;
                        userData.errMessage = 'Ok';

                        delete user.password;
                        userData.user = user;
                    } else {
                        userData.errCode = 3;
                        userData.errMessage = 'Wrong Password';
                    }
                } else {
                    userData.errCode = 2,
                        userData.errMessage = `User's not found!`
                }
            } else {
                // return error
                userData.errCode = 1;
                userData.errMessage = `Your email isn't exist in system. Plz try other email!`
            }
            resolve(userData)
        } catch (e) {
            reject(e);
        }
    })
}

let checkUserEmail = (userEmail) => {
    return new Promise(async (resolve, reject) => {
        try {
            let user = await db.User.findOne({
                where: { email: userEmail }

            })
            if (user) {
                resolve(true)
            } else {
                resolve(false)
            }
        } catch (e) {
            reject(e)
        }
    })
}

let getAllUsers = (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let users = '';
            if (userId === 'ALL') {
                users = await db.User.findAll({
                    attributes: {
                        exclude: ['password']
                    }
                })
            }
            if (userId && userId !== 'ALL') {
                users = await db.User.findOne({
                    where: {
                        id: userId,
                    },
                    attributes: {
                        exclude: ['password']
                    }
                })
            }
            resolve(users)
        } catch (e) {
            reject(e)
        }
    })
}

let createNewUser = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            let check = await checkUserEmail(data.email);
            if (check === true) {
                resolve({
                    errCode: 1,
                    message: 'Your email is already in used. Plz try another email!'
                })
            }

            let hashPasswordFromBcrypt = await hashUserPassword(data.password);

            await db.User.create({
                email: data.email,
                password: hashPasswordFromBcrypt,
                firstName: data.firstName,
                lastName: data.lastName,
                address: data.address,
                phonenumber: data.phoneNumber,
                gender: data.gender === '1' ? true : false,
                roleId: data.roleId,
            })

            resolve({
                errCode: 0,
                message: 'OK'
            });
        } catch (e) {
            reject(e)
        }
    })
}

let editUser = (data) => {
    return new Promise(async (resolve, reject) => {
        if (!data) {
            resolve({
                errCode: 1,
                errMessage: 'Missing required parameter!'
            })
        }
        let user = await db.User.findOne({
            where: { id: data.id },
            raw: false,
        })
        if (user) {
            user.firstName = data.firstName;
            user.lastName = data.lastName;
            user.address = data.address;

            await user.save();
            resolve({
                errCode: 0,
                message: 'The user is updated!'
            });
        } else {
            resolve();
        }
    })
}

let deleteUser = (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let user = await db.User.findOne({
                where: { id: userId }
            })
            if (!user) {
                resolve({
                    errCode: 2,
                    errMessage: 'User is not exist!'
                })
            }

            await db.User.destroy({
                where: { id: userId }
            })
            resolve({
                errCode: 0,
                message: 'User is deleted!'
            })
        } catch (e) {
            reject(e)
        }
    })
}

module.exports = {
    handleUserLogin: handleUserLogin,
    checkUserEmail: checkUserEmail,
    getAllUsers: getAllUsers,
    createNewUser: createNewUser,
    deleteUser: deleteUser,
    editUser: editUser,
}