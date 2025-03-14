import { checkIsDefined } from './nullable';
import { userAttributesService } from './user-attributes';
export const getDefaultCanTrack = (canTrack?: boolean) => {
  const result = checkIsDefined(canTrack) ? canTrack : true;
  userAttributesService.setCanTrack(result);
  return result;
};
