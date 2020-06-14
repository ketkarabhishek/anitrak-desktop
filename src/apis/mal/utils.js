import { CURRENT, COMPLETED, PLANNED, ONHOLD, DROPPED } from "apis/constants"

export function getMalStatusCode(status) {
  switch (status) {
    case CURRENT:
      return 1

    case COMPLETED:
      return 2

    case PLANNED:
      return 6

    case ONHOLD:
      return 3

    case DROPPED:
      return 4

    default:
      break
  }
}

export function getKitsuStatusCode(status) {
  switch (status) {
    case 1:
      return CURRENT

    case 2:
      return COMPLETED

    case 6:
      return PLANNED

    case 3:
      return ONHOLD

    case 4:
      return DROPPED

    default:
      break
  }
}
