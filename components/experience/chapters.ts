export const chapters = [
 {id:'project',at:0,label:'Meet the rover',title:'Made to move.',accent:'Built to explore.',note:'An ESP32 mecanum rover. Built by hand. Explored in 3D.',mark:'',theme:'light',part:0},
 {id:'movement',at:.13,label:'Every direction',title:'Four wheels.',accent:'Servo-motor controlled.',note:'Forwards. Sideways. Diagonally. Around its own centre.',mark:'4 × 4',theme:'dark',part:0},
 {id:'rollers',at:.23,label:'The mecanum wheels',title:'A different angle.',accent:'A different move.',note:'Passive rollers at 45° turn four motors into freedom of movement.',mark:'45°',theme:'dark',part:1},
 {id:'chassis',at:.33,label:'The metal chassis',title:'Two decks.',accent:'Scalable Design Engineering.',note:'Perforated metal, brass standoffs, and a place for every part (or almost!).',mark:'02',theme:'dark',part:2},
 {id:'controller',at:.43,label:'The ESP32',title:'A small powerful brain.',accent:'Better possibilities.',note:'The ESP32 sends the signals.',mark:'ESP32',theme:'dark',part:3},
 {id:'drivers',at:.53,label:'The motor drivers',title:'Signals in.',accent:'Motion out.',note:'Two L298N boards switch power to four independent gear motors.',mark:'L298N',theme:'dark',part:3},
 {id:'power',at:.63,label:'The power source',title:'A little power.',accent:'A lot of go.',note:'Two rechargeable 18650 cells, tucked into a single battery holder.',mark:'18650',theme:'dark',part:4},
 {id:'distance',at:.73,label:'The distance sensor',title:'Sense what’s ahead.',accent:'Measure the distance.',note:'The front-mounted HC-SR04 sends an ultrasonic pulse and times its echo to measure how far away an obstacle is.',mark:'ECHO',theme:'dark',part:5},
 {id:'connections',at:.86,label:'The code',title:'Nothing moves',accent:'without logic.',note:'The control code coordinates direction, speed, and all four motor channels.',mark:'CODE',theme:'light',part:0},
 {id:'explore',at:.965,label:'Explore the rover',title:'Your turn.',accent:'Make your move.',note:'',mark:'',theme:'light',part:0},
] as const;
export type StoryChapter = {title:string;accent:string;mark:string};
export const futureWorkChapter = {label:'Scalable design',title:'Stack the decks.',accent:'Expand the design.',note:'Two extra decks make room for lights, a light sensor, and a chime. The original control deck stays on top. Separate the layers to explore the stack.',mark:'MORE'};
export const scanWorkChapter = {label:'180° distance scanning',title:'Look left. Look right.',accent:'Sense the whole front.',note:'A small servo rotates the distance sensor through 180°, building a wider picture of nearby obstacles, one echo at a time.',mark:''};
export const visionWorkChapter = {label:'Vision + understanding',title:'See the world.',accent:'Understand the way.',note:'A DJI O4 camera above the distance sensor could feed a vision-language model, turning images into an understanding of the surroundings. An illustrated future-work concept.',mark:''};
export function getChapter(p:number){return p<.095?0:p<.195?1:p<.295?2:p<.395?3:p<.495?4:p<.595?5:p<.695?6:p<.795?7:p<.905?8:9;}
const smootherstep = (value:number) => {
 const t=Math.min(1,Math.max(0,value));
 return t*t*t*(t*(t*6-15)+10);
};
export function explosionAt(p:number){const stops=[[0,0],[.145,0],[.245,.4],[.345,.78],[.435,1],[.765,1],[.795,.97],[.9,0],[1,0]];for(let i=1;i<stops.length;i++){if(p<=stops[i][0]){const[a,x]=stops[i-1], [b,y]=stops[i];const t=smootherstep((p-a)/(b-a));return x+(y-x)*t;}}return 0;}
export function cameraAt(p:number){const stops=[[0,.69,1.08],[.12,1.05,1.2],[.23,1.51,1.25],[.34,.65,.77],[.44,.32,.83],[.54,-.72,1.02],[.64,-2.35,.92],[.73,-5.59,1.08],[.9,-5.59,1.08],[1,-5.59,1.08]];for(let i=1;i<stops.length;i++){if(p<=stops[i][0]){const a=stops[i-1],b=stops[i];const t=smootherstep((p-a[0])/(b[0]-a[0]));return {theta:a[1]+(b[1]-a[1])*t,phi:a[2]+(b[2]-a[2])*t};}}return {theta:-5.59,phi:1.08};}
