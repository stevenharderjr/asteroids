export function humanTime(ms) {
  if (ms <= 1000) return ms.toFixed(2) + ' ms';

  if (ms <= 60000) {
    const roundedSeconds = (ms / 1000).toFixed(2);
    return (
      'about ' +
      roundedSeconds +
      (roundedSeconds === 1 ? ' second' : ' seconds')
    );
  }

  if (ms <= 3600000) {
    const roundedMinutes = Math.round(ms / 60000);
    return (
      'about ' +
      roundedMinutes +
      (roundedMinutes === 1 ? ' minute' : ' minutes')
    );
  }

  if (ms < 86400000) {
    const roundedHours = Math.round(ms / 3600000);
    return 'about ' + roundedHours + (roundedHours === 1 ? ' hour' : ' hours');
  }

  if (ms < 604800000) {
    const roundedDays = Math.round(ms / 86400000);
    return 'about ' + roundedDays + (roundedDays === 1 ? ' day' : ' days');
  }

  if (ms < 2629800000) {
    const roundedWeeks = Math.round(ms / 604800000);
    return 'about ' + roundedWeeks + (roundedWeeks === 1 ? ' week' : ' weeks');
  }

  if (ms < 31556952000) {
    const roundedMonths = Math.round(ms / 2629800000);
    return (
      'about ' + roundedMonths + (roundedMonths === 1 ? ' month' : ' months')
    );
  }

  const roundedYears = Math.round(ms / 31556952000);
  return 'about ' + roundedYears + (roundedYears === 1 ? ' year' : ' years');
}

function ms(time, unit) {
  if (typeof unit !== 'string' || unit === 'ms') return time;

  // returns specified duration in milliseconds
  switch (unit.substring(0, 3)) {
    case 'sec':
      return time * 1000;
    case 'min':
      return time * 60000;
    case 'hou':
      return time * 3600000;
    case 'day':
      return time * 86400000;
    case 'wee':
      return time * 604800000;
    case 'mon':
      return time * 2629800000;
    default:
      break;
  }

  switch (unit.substring(0, 2)) {
    case 'wk':
      return time * 604800000;
    case 'mo':
      return time * 2629800000;
    default:
      break;
  }

  switch (unit[0]) {
    case 's':
      return time * 1000;
    case 'm':
      return time * 60000;
    case 'h':
      return time * 3600000;
    case 'd':
      return time * 86400000;
    default:
      return;
  }
}

function duration() {
  return (time, unit) => ({
    toMs: () => ms(time, unit),

    fromMs: () => {
      let response = { milliseconds: time };
      if (time <= 1000) return response;

      response.seconds = time / 1000;
      if (time <= 60000) return response;

      response.minutes = time / 60000;
      if (time <= 3600000) return response;

      response.hours = time / 3600000;
      if (time < 86400000) return response;

      response.days = time / 86400000;
      if (time < 604800000) return response;

      response.weeks = time / 604800000;
      if (time < 2629800000) return response;

      response.months = time / 2629800000;
      if (time < 31556952000) return response;

      response.years = time / 31556952000;
      return response;
    },

    descriptive: () => {
      return humanTime(ms(time, unit));
    },
  });
}

// function fromMs(time) {
//   let response = { milliseconds: time };
//   if (time <= 1000) return response;

//   response.seconds = time / 1000;
//   if (time <= 60000) return response;

//   response.minutes = time / 60000;
//   if (time <= 3600000) return response;

//   response.hours = time / 3600000;
//   if (time < 86400000) return response;

//   response.days = time / 86400000;
//   if (time < 604800000) return response;

//   response.weeks = time / 604800000;
//   if (time < 2629800000) return response;

//   response.months = time / 2629800000;
//   if (time < 31556952000) return response;

//   response.years = time / 31556952000;
//   return response;
// }

function timeUntil(futureDate) {
  return humanTime(futureDate - Date.now());
}

function timeSince(start) {
  return humanTime(performance.now() - start);
}

// module.exports = { duration: duration(), timeSince, timeUntil, ms };
