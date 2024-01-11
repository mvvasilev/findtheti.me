import dayjs, { Dayjs } from "dayjs";
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import duration from 'dayjs/plugin/duration';
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(localizedFormat)
dayjs.extend(duration);

const utils = {
    performRequest: (url: string | URL | Request, options?: RequestInit | undefined): Promise<any> => {
        return fetch(url, options).then(async resp => {
            if (!resp.ok) {
                let errorTextResult = await resp.text();

                var errorMsg = errorTextResult;

                try {
                    let jsonResult: any = JSON.parse(errorTextResult);

                    errorMsg = jsonResult?.error?.message;
                } catch(err) {
                    errorMsg = errorTextResult;
                }

                throw errorMsg;
            } else {
                let successTextResult = await resp.text();

                try {
                    let jsonResult = JSON.parse(successTextResult);

                    return jsonResult?.result;
                } catch(err) {
                    return successTextResult;
                }
            }
        })
    },
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
    },
    dayjsIsBetweenUnixExclusive: (lowerBound: Dayjs, time: Dayjs, upperBound: Dayjs): boolean => {
        return lowerBound.unix() <= time.unix() && time.unix() < upperBound.unix()
    },
    dayjsIsBetweenUnixInclusive: (lowerBound: Dayjs, time: Dayjs, upperBound: Dayjs): boolean => {
        return lowerBound.unix() <= time.unix() && time.unix() <= upperBound.unix()
    },
    isSpinnerShown: (): boolean => {
        return localStorage.getItem("SpinnerShowing") === "true";
    },
    showSpinner: (): void => {
        localStorage.setItem("SpinnerShowing", "true");
        window.dispatchEvent(new Event("onSpinnerStatusChange"));
    },
    hideSpinner: (): void => {
        localStorage.removeItem("SpinnerShowing");
        window.dispatchEvent(new Event("onSpinnerStatusChange"));
    },
    isNullOrUndefined: (thing: any): boolean => {
        return thing === null || thing === undefined;
    }
}

export default utils;