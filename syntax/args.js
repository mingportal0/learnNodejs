const args = process.argv;

/* result : node syntax/args.js a
[
  'C:\\Program Files\\nodejs\\node.exe', //nodejs runtime 위치
  'C:\\demoServer\\learnNodejs\\syntax\\args.js', //실행시킨 파일 위치
  'a' //param
]
*/
console.log(args);