import User from '../../src/db/models/User';
import Conversation from '../../src/db/models/Conversation';

export const createUser = async data => {
  const user = new User(data);
  return await user.save();
};

export const createConversation = async ({ recipients, title }) => {
  const conversation = new Conversation({ recipients, title });
  return await conversation.save();
};
