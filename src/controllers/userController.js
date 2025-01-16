import userService from '../services/userService'

let handleLongin = async (req, res) => {
    let email = req.body.email;
    let password = req.body.password;

    if (!email || !password) {
        return res.status(500).json({
            errCode: 1,
            message: 'Missing inputs parameter!'
        })
    }

    let userData = await userService.handleUserLogin(email, password);
    console.log(userData);

    return res.status(200).json({
        errCode: userData.errCode,
        message: userData.errMessage,
        user: userData.user ? userData.user : {}
    })
}

let handleGetAllUsers = async (req, res) => {
    let userId = req.query.id;

    if (!userId) {
        return res.status(200).json({
            errCode: 1,
            errMessage: 'Missing required parameters!',
            users: [],
        })
    }

    let users = await userService.getAllUsers(userId);
    console.log(users)
    return res.status(200).json({
        errCode: 0,
        errMessage: 'OK',
        users,
    })
}

let handleCreateNewUser = async (req, res) => {
    let message = await userService.createNewUser(req.body)
    console.log(message)
    return res.status(200).json(message);
}

let handleEditUser = async (req, res) => {
    let data = req.body;
    let message = await userService.editUser(data);
    return res.status(200).json(message)
}

let handleDeleteUser = async (req, res) => {
    if (!req.body.id) {
        return res.status(200).json({
            errCode: 1,
            message: 'Missing requires parameters!'
        })
    }
    let message = await userService.deleteUser(req.body.id)
    return res.status(200).json(message);
}

module.exports = {
    handleLongin: handleLongin,
    handleGetAllUsers: handleGetAllUsers,
    handleCreateNewUser: handleCreateNewUser,
    handleEditUser: handleEditUser,
    handleDeleteUser: handleDeleteUser,
}
