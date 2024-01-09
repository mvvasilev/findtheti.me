import dayjs from "dayjs";
import * as duration from 'dayjs/plugin/duration';

dayjs.extend(duration)

const utils = {
    toHoursAndMinutes: (totalMinutes: number): { hours: number, minutes: number } => {
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        
        return { hours, minutes };
    },
    formatMinutesAsHoursMinutes: (val: number): String => {
        let { hours, minutes } = utils.toHoursAndMinutes(val);

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else {
            return `${minutes}m`;
        }
    },
    zeroPad: (num: number, places: number): String => {
        return String(num).padStart(places, '0');
    },
    formatTimeFromHourOfDay: (hourOfDay: number, minutes: number): String => {
        return dayjs.duration({ hours: hourOfDay, minutes: minutes }).format('HH:mm');
    }
}

export default utils;