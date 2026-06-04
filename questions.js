const questions = [
{
question: "What does DCS stand for?",
options: ["Digital Control System","Distributed Control System","Direct Communication System","Data Control Station"],
answer: 1
},
{
question: "Which system is the Main DCS in the plant?",
options: ["PCS7","PI System","Emerson DeltaV","SIS"],
answer: 2
},
{
question: "Which area uses Siemens PCS7?",
options: ["ISBL","OSBL","STG","Utilities"],
answer: 2
},
{
question: "Why was DCS created?",
options: [
"To replace operators",
"To solve increasing process complexity",
"To eliminate PLCs",
"To reduce electricity consumption"
],
answer: 1
},
{
question: "What is a major disadvantage of a centralized control system?",
options: [
"Easy expansion",
"High reliability",
"Single point of failure",
"Low maintenance"
],
answer: 2
},
{
question: "Which is an advantage of DCS?",
options: [
"Single point of failure",
"Higher availability",
"More wiring",
"Limited scalability"
],
answer: 1
},
{
question: "What is the primary function of HMI?",
options: [
"Store backups",
"Control network switches",
"Operator monitoring and control",
"Configure firewalls"
],
answer: 2
},
{
question: "Which feature improves troubleshooting in DCS?",
options: [
"Alarm History",
"Removing alarms",
"Manual logging",
"Extra wiring"
],
answer: 0
},
{
question: "Which component stores historical process data?",
options: [
"Historian",
"Controller",
"I/O Card",
"Switch"
],
answer: 0
},
{
question: "Cybersecurity in DCS helps protect against:",
options: [
"Process flow",
"Unauthorized access",
"Temperature changes",
"Pump failures"
],
answer: 1
},

// IO & Field Devices

{
question: "Which signal type represents ON/OFF status?",
options: ["AI","AO","DI","PID"],
answer: 2
},
{
question: "A Push Button is an example of:",
options: ["DO","AO","DI","AI"],
answer: 2
},
{
question: "Which signal type is typically 4-20mA from a transmitter?",
options: ["DI","DO","AI","Relay"],
answer: 2
},
{
question: "A control valve positioner normally receives:",
options: ["AI","AO","DI","Pulse Input"],
answer: 1
},
{
question: "Which device is commonly connected to an Analog Input?",
options: [
"Indicator Lamp",
"Temperature Transmitter",
"Relay",
"Push Button"
],
answer: 1
},

// Process Control

{
question: "What does PV stand for?",
options: [
"Pressure Valve",
"Process Variable",
"Primary Value",
"Plant Variable"
],
answer: 1
},
{
question: "What does SP stand for?",
options: [
"Signal Process",
"Set Point",
"Safety Point",
"Secondary Process"
],
answer: 1
},
{
question: "In a control loop, the controller compares:",
options: [
"PV and SP",
"AI and AO",
"DI and DO",
"Flow and Level"
],
answer: 0
},
{
question: "What does FT represent?",
options: [
"Flow Trip",
"Flow Transmitter",
"Flow Test",
"Field Transmitter"
],
answer: 1
},
{
question: "What does TIC represent?",
options: [
"Temperature Indicator Controller",
"Temperature Interlock Controller",
"Temperature Input Controller",
"Temperature Instrument Card"
],
answer: 0
},

// Control Strategies

{
question: "Which is the most common control strategy?",
options: [
"Ratio Control",
"Cascade Control",
"Feedback Control",
"Selector Control"
],
answer: 2
},
{
question: "Which control strategy acts before a disturbance affects the process?",
options: [
"Feedback",
"Feedforward",
"Cascade",
"Override"
],
answer: 1
},
{
question: "Which control strategy uses a master and slave controller?",
options: [
"Feedback",
"Ratio",
"Cascade",
"Split Range"
],
answer: 2
},
{
question: "Which control strategy maintains a constant ratio between two flows?",
options: [
"Ratio Control",
"Feedback",
"Cascade",
"Selector"
],
answer: 0
},
{
question: "Which control strategy uses one controller output to operate two valves?",
options: [
"Cascade",
"Ratio",
"Split Range",
"Feedforward"
],
answer: 2
},

// Alarm & SIS

{
question: "What is an alarm?",
options: [
"Automatic shutdown",
"Notification requiring operator attention",
"Controller failure",
"Valve movement"
],
answer: 1
},
{
question: "Which alarm priority requires immediate response?",
options: [
"Advisory",
"Warning",
"Critical",
"Low"
],
answer: 2
},
{
question: "What is the difference between Alarm and Trip?",
options: [
"They are the same",
"Alarm informs, Trip acts automatically",
"Trip only warns",
"Alarm shuts down equipment"
],
answer: 1
},
{
question: "What does SIS stand for?",
options: [
"System Integration Server",
"Safety Instrumented System",
"Signal Interface System",
"Safety Information Server"
],
answer: 1
},
{
question: "What is the primary goal of SIS?",
options: [
"Increase production",
"Store historical data",
"Bring the process to a safe state",
"Reduce alarms"
],
answer: 2
}
];
