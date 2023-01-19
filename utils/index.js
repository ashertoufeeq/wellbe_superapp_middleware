const moment = require("moment");

const calculateAge = (dob) => {
    const ts = Date.parse(dob);

    let age = moment().diff(ts, 'years');
    if (age > 0) {
        const months = moment().diff(ts, 'months') - age * 12;
        age = age + ' Y';

        if (months > 0) {
            age += ', ' + months + ' M';
        }
        return age;
    } else {
        age = moment().diff(ts, 'months');
        if (age > 0) {
            return age + ' M';
        } else {
            age = moment().diff(ts, 'days');
            return age + ' D';
        }
    }
};


module.exports = {
    calculateAge,
}
