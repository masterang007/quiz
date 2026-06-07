/* =========================================================================
   DCS Awareness Quiz — Question Bank
   Source: Question.txt  (10 chapters × 5 questions = 50 total)
   ========================================================================= */
window.QUESTIONS = [

  // ── Process Control ─────────────────────────────────
  {
    category: "Process Control",
    question: "What is the main purpose of process control?",
    options: [
      "To decorate the HMI",
      "To keep the process at the desired value",
      "To store documents",
      "To print reports"
    ],
    correctAnswer: 1
  },
  {
    category: "Process Control",
    question: "What does PV stand for?",
    options: [
      "Process Variable",
      "Pressure Valve",
      "Process Valve",
      "Process Value"
    ],
    correctAnswer: 0
  },
  {
    category: "Process Control",
    question: "What does a controller do when temperature becomes too high?",
    options: [
      "Ignore it",
      "Take action to reduce the temperature",
      "Shut down the DCS",
      "Create a report"
    ],
    correctAnswer: 1
  },
  {
    category: "Process Control",
    question: "Which is a basic control loop?",
    options: [
      "Sensor, Controller, Valve",
      "Sensor, Printer, Monitor",
      "Valve, Keyboard, Mouse",
      "Controller only"
    ],
    correctAnswer: 0
  },
  {
    category: "Process Control",
    question: "Feedback control uses:",
    options: [
      "Actual process value (PV)",
      "Weather data",
      "Historical data",
      "Operator opinion"
    ],
    correctAnswer: 0
  },

  // ── I/O and Field Devices ────────────────────────────
  {
    category: "I/O and Field Devices",
    question: "What does an RTD measure?",
    options: [
      "Flow",
      "Temperature",
      "Pressure",
      "Level"
    ],
    correctAnswer: 1
  },
  {
    category: "I/O and Field Devices",
    question: "What does an Analog Input (AI) receive?",
    options: [
      "Signal from a field device",
      "Signal to a valve",
      "Signal to a printer",
      "Signal from an operator"
    ],
    correctAnswer: 0
  },
  {
    category: "I/O and Field Devices",
    question: "A digital signal is usually:",
    options: [
      "ON/OFF",
      "4-20 mA",
      "0-100%",
      "1-5 V"
    ],
    correctAnswer: 0
  },
  {
    category: "I/O and Field Devices",
    question: "What is the function of a valve positioner?",
    options: [
      "Control valve position",
      "Control alarms",
      "Control the controller",
      "Store data"
    ],
    correctAnswer: 0
  },
  {
    category: "I/O and Field Devices",
    question: "4-20 mA is an example of:",
    options: [
      "Analog signal",
      "Digital signal",
      "Ethernet signal",
      "Wireless signal"
    ],
    correctAnswer: 0
  },

  // ── DeltaV ──────────────────────────────────────────
  {
    category: "DeltaV",
    question: "What is DeltaV?",
    options: [
      "A DCS system",
      "A PLC only",
      "A database",
      "A printer"
    ],
    correctAnswer: 0
  },
  {
    category: "DeltaV",
    question: "What is used by an operator to monitor the process?",
    options: [
      "Operator Station",
      "Controller",
      "I/O Card",
      "Transmitter"
    ],
    correctAnswer: 0
  },
  {
    category: "DeltaV",
    question: "What does a DeltaV Controller do?",
    options: [
      "Executes control strategies",
      "Prints reports",
      "Stores manuals",
      "Displays trends"
    ],
    correctAnswer: 0
  },
  {
    category: "DeltaV",
    question: "What is DeltaV Explorer mainly used for?",
    options: [
      "System configuration",
      "Alarm acknowledgement",
      "Trend viewing",
      "Email"
    ],
    correctAnswer: 0
  },
  {
    category: "DeltaV",
    question: "What is the purpose of a Historian?",
    options: [
      "Store process data",
      "Control valves",
      "Execute logic",
      "Create alarms"
    ],
    correctAnswer: 0
  },

  // ── DeltaV Function Blocks ───────────────────────────
  {
    category: "DeltaV Function Blocks",
    question: "What is the purpose of an AI Block?",
    options: [
      "Read an analog signal",
      "Control a valve",
      "Store data",
      "Generate alarms"
    ],
    correctAnswer: 0
  },
  {
    category: "DeltaV Function Blocks",
    question: "Which block is commonly used for process control?",
    options: [
      "PID Block",
      "Alarm Block",
      "Trend Block",
      "Report Block"
    ],
    correctAnswer: 0
  },
  {
    category: "DeltaV Function Blocks",
    question: "What does an AO Block do?",
    options: [
      "Send an analog output signal",
      "Receive alarms",
      "Store history",
      "Generate reports"
    ],
    correctAnswer: 0
  },
  {
    category: "DeltaV Function Blocks",
    question: "What is a CALC Block used for?",
    options: [
      "Calculations and logic",
      "Trend storage",
      "Alarm management",
      "Printing"
    ],
    correctAnswer: 0
  },
  {
    category: "DeltaV Function Blocks",
    question: "Function blocks are connected to create:",
    options: [
      "A Control Strategy",
      "A Trend",
      "An Alarm List",
      "A Report"
    ],
    correctAnswer: 0
  },

  // ── Logic ────────────────────────────────────────────
  {
    category: "Logic",
    question: "Logic is mainly based on:",
    options: [
      "TRUE or FALSE",
      "Colors",
      "Trends",
      "Reports"
    ],
    correctAnswer: 0
  },
  {
    category: "Logic",
    question: "Which gate requires all inputs to be TRUE?",
    options: [
      "OR",
      "AND",
      "NOT",
      "XOR"
    ],
    correctAnswer: 1
  },
  {
    category: "Logic",
    question: "What does a NOT gate do?",
    options: [
      "Reverses the input state",
      "Adds inputs",
      "Stores data",
      "Creates alarms"
    ],
    correctAnswer: 0
  },
  {
    category: "Logic",
    question: "A digital input is usually:",
    options: [
      "ON or OFF",
      "4-20 mA",
      "0-100%",
      "Temperature"
    ],
    correctAnswer: 0
  },
  {
    category: "Logic",
    question: "Why is logic used?",
    options: [
      "To make automatic decisions",
      "To create reports",
      "To store trends",
      "To display graphics"
    ],
    correctAnswer: 0
  },

  // ── Control Strategy ─────────────────────────────────
  {
    category: "Control Strategy",
    question: "What is a Control Strategy?",
    options: [
      "Connected blocks used to control a process",
      "A list of alarms",
      "A trend display",
      "A report"
    ],
    correctAnswer: 0
  },
  {
    category: "Control Strategy",
    question: "In feedback control, the controller uses:",
    options: [
      "PV (Process Variable)",
      "Alarm status",
      "Operator name",
      "Historical data"
    ],
    correctAnswer: 0
  },
  {
    category: "Control Strategy",
    question: "Feedforward control acts based on:",
    options: [
      "Measured disturbance",
      "Alarm priority",
      "Trend data",
      "Reports"
    ],
    correctAnswer: 0
  },
  {
    category: "Control Strategy",
    question: "Which block is commonly found in a control strategy?",
    options: [
      "PID Block",
      "Printer Block",
      "Report Block",
      "Email Block"
    ],
    correctAnswer: 0
  },
  {
    category: "Control Strategy",
    question: "Where is the control strategy executed?",
    options: [
      "Controller",
      "HMI",
      "Historian",
      "Printer"
    ],
    correctAnswer: 0
  },

  // ── DeltaV Sequence ──────────────────────────────────
  {
    category: "DeltaV Sequence",
    question: "What is a Sequence used for?",
    options: [
      "Running steps in order",
      "Storing trends",
      "Managing alarms",
      "Printing reports"
    ],
    correctAnswer: 0
  },
  {
    category: "DeltaV Sequence",
    question: "What is the first step of a sequence usually called?",
    options: [
      "Start Step",
      "End Step",
      "Alarm Step",
      "Report Step"
    ],
    correctAnswer: 0
  },
  {
    category: "DeltaV Sequence",
    question: "Sequence control is commonly used for:",
    options: [
      "Batch processes",
      "Alarm management",
      "Data storage",
      "Reporting"
    ],
    correctAnswer: 0
  },
  {
    category: "DeltaV Sequence",
    question: "What does a Transition do?",
    options: [
      "Moves to the next step when conditions are met",
      "Creates an alarm",
      "Stores data",
      "Changes HMI color"
    ],
    correctAnswer: 0
  },
  {
    category: "DeltaV Sequence",
    question: "A sequence is made up of:",
    options: [
      "Steps and Transitions",
      "AI and AO",
      "Alarms and Events",
      "Trends and Reports"
    ],
    correctAnswer: 0
  },

  // ── Alarm ────────────────────────────────────────────
  {
    category: "Alarm",
    question: "Why are alarms used?",
    options: [
      "To alert the operator",
      "To store data",
      "To control valves",
      "To create reports"
    ],
    correctAnswer: 0
  },
  {
    category: "Alarm",
    question: "What does Active/Unack mean?",
    options: [
      "Alarm is active and not acknowledged",
      "Alarm is active and acknowledged",
      "Alarm is cleared",
      "Alarm is deleted"
    ],
    correctAnswer: 0
  },
  {
    category: "Alarm",
    question: "What does Active/Ack mean?",
    options: [
      "Alarm is active and acknowledged",
      "Alarm is cleared",
      "Alarm is deleted",
      "Alarm is disabled"
    ],
    correctAnswer: 0
  },
  {
    category: "Alarm",
    question: "What does alarm priority indicate?",
    options: [
      "Importance of the alarm",
      "Alarm color only",
      "Alarm age",
      "Operator name"
    ],
    correctAnswer: 0
  },
  {
    category: "Alarm",
    question: "Before acknowledging an alarm, the operator should:",
    options: [
      "Understand the cause of the alarm",
      "Restart the system",
      "Delete the alarm",
      "Turn off the HMI"
    ],
    correctAnswer: 0
  },

  // ── SIS (Safety Instrumented System) ────────────────
  {
    category: "SIS (Safety Instrumented System)",
    question: "What is the main purpose of SIS?",
    options: [
      "Protect people, equipment, and the process",
      "Store trends",
      "Create reports",
      "Display graphics"
    ],
    correctAnswer: 0
  },
  {
    category: "SIS (Safety Instrumented System)",
    question: "When does SIS take action?",
    options: [
      "When a dangerous condition is detected",
      "When a report is generated",
      "When a trend is viewed",
      "When an operator logs in"
    ],
    correctAnswer: 0
  },
  {
    category: "SIS (Safety Instrumented System)",
    question: "SIS is different from DCS because:",
    options: [
      "It focuses on safety functions",
      "It stores more data",
      "It has more screens",
      "It prints reports"
    ],
    correctAnswer: 0
  },
  {
    category: "SIS (Safety Instrumented System)",
    question: "In a Cause & Effect Matrix, what is the \"Cause\"?",
    options: [
      "Condition that triggers an action",
      "Final action",
      "Operator response",
      "Alarm priority"
    ],
    correctAnswer: 0
  },
  {
    category: "SIS (Safety Instrumented System)",
    question: "Which is an example of an SIS action?",
    options: [
      "Close an ESD valve",
      "Display a trend",
      "Print a report",
      "Save a document"
    ],
    correctAnswer: 0
  },

  // ── PI System ────────────────────────────────────────
  {
    category: "PI System",
    question: "What is PI System mainly used for?",
    options: [
      "Collecting and analyzing process data",
      "PID control",
      "Alarm acknowledgement",
      "Sequence control"
    ],
    correctAnswer: 0
  },
  {
    category: "PI System",
    question: "What does PI Historian store?",
    options: [
      "Historical process data",
      "Logic diagrams",
      "Controller programs",
      "Alarm settings"
    ],
    correctAnswer: 0
  },
  {
    category: "PI System",
    question: "What is PI Vision used for?",
    options: [
      "Displaying trends and dashboards",
      "Controlling valves",
      "Programming controllers",
      "Managing alarms"
    ],
    correctAnswer: 0
  },
  {
    category: "PI System",
    question: "Where does PI System get its data from?",
    options: [
      "DCS, PLC, and other systems",
      "Printers",
      "Keyboards",
      "Cameras"
    ],
    correctAnswer: 0
  },
  {
    category: "PI System",
    question: "What is a benefit of PI System?",
    options: [
      "Better process analysis and reporting",
      "Replacing controllers",
      "Replacing SIS",
      "Replacing transmitters"
    ],
    correctAnswer: 0
  }

];
