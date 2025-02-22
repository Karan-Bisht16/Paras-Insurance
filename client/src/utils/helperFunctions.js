const toFormattedDate = (timestamp) => {
    if (timestamp) {
        const formattedDate = new Date(Date.parse(timestamp));
        const date = formattedDate.getDate();
        const monthsArray = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const month = monthsArray[formattedDate.getMonth()];
        const year = formattedDate.getFullYear();

        return `${date} ${month}, ${year}`;
    }
    return '';
}

const toFormattedTime = (timestamp) => {
    const date = new Date(Date.parse(timestamp))

    const hours24 = date.getHours();
    const minutes = date.getMinutes();

    const period = hours24 >= 12 ? 'PM' : 'AM';
    const hours12 = hours24 % 12 || 12;

    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
}

const calculateAge = (dobString) => {
    if (!dobString) {
        return '-';
    }
    const dob = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();

    const isBirthdayPassed =
        today.getMonth() > dob.getMonth() ||
        (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate());

    if (!isBirthdayPassed) { age-- }

    return age;
}

const getSuffix = (number) => {
    if (typeof number !== "number" || !Number.isInteger(number)) {
        return "Invalid input. Please provide an integer.";
    }

    const suffixes = ["th", "st", "nd", "rd"];
    const remainder = number % 100;

    if (remainder >= 11 && remainder <= 13) {
        return number + "th";
    }

    const lastDigit = number % 10;
    const suffix = suffixes[lastDigit] || "th";

    return suffix;
}

const convertToISODate = (dateString) => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return dateString;
    }

    const [day, month, year] = dateString.split("-");
    return `${year}-${month}-${day}`;
};

export {
    toFormattedDate,
    toFormattedTime,
    calculateAge,
    getSuffix,
    convertToISODate,
};