import User from "../../../db/models/User";

export const getUserById = async (id) => {
    const user = await User.findById(id);

    return user;
};