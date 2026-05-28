export function random(len: number) {
  const options = "kjhgfdtyujnbvkkjhgfdfghjkgf2345432";
  let ans = "";

  for (let i = 0; i < len; i += 1) {
    ans += options[Math.floor(Math.random() * options.length)];
  }

  return ans;
}
