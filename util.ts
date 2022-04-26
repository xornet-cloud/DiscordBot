export function parseTime(time: number): string {
  const units = ["y", "w", "d", "h", "m", "s"];
  let timeArray: number[] = [];
  let timeString = "";

  timeArray.push(time / 31536000);
  timeArray.push((time / 604800) % 52);
  timeArray.push((time / 86400) % 7);
  timeArray.push((time / 3600) % 24);
  timeArray.push((time / 60) % 60);
  timeArray.push(time % 60);

  for (let i = 0; i < timeArray.length; i++) {
    if (timeArray[i] > 0) {
      timeString += timeArray[i].toFixed(0) + units[i];
    }
  }
  return timeString;
}
