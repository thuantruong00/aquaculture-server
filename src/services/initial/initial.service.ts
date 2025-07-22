import { Zone } from "~/entities/zone.entity";
import { ZoneRepository } from "~/repositories";

export const initialService = async () => {
  await handleInitDefaultDeviceZone();
  return;
};
const handleInitDefaultDeviceZone = async () => {
  const isExistedZone = await Zone.find({});
  if (isExistedZone.length < 1) {
    await ZoneRepository.createDefaultZone();
  }
  return;
};
