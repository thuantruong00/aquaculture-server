import bcrypt from "bcrypt";
import { Zone } from "~/entities/zone.entity";
import { ZoneRepository } from "~/repositories";
import { UserRole, UserStatus } from "~/utils/enum";
import { User } from "~/entities/user.entity";
import { env } from "~/utils";
import { logger } from "~/utils/logger";
import { NotificationOptionRepository } from "~/repositories/notification-option.repo";

export const initialService = async () => {
  if (Number(env.INIT)) {
    logger.debug(`Init service: ${Number(env.INIT)}`);
    await handleInitDefaultDeviceZone();
    await handleInitRootUser();
    await NotificationOptionRepository.createDefaultNotification();
  } else {
    logger.debug(`Init service: skip`);
  }
  return;
};
const handleInitDefaultDeviceZone = async () => {
  const isExistedZone = await Zone.find({});
  if (isExistedZone.length < 1) {
    await ZoneRepository.createDefaultZone();
  }
  return;
};
const handleInitRootUser = async () => {
  const findRootUser = await User.findOne({ username: { $eq: "root" } });
  if (!findRootUser) {
    const salt = await bcrypt.genSalt(10);
    const createAccount = await User.create({
      username: "root",
      nickname: "root",
      password: "12345poimnb1",
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      salt,
    });
  }
  return;
};
