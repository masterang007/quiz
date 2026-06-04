/* =========================================================================
   DCS Awareness Quiz — Question Bank
   30+ multiple-choice questions covering DCS fundamentals, DeltaV, PCS7,
   PLC, HMI, I/O, field devices, process control, alarm management, SIS,
   cybersecurity, and PI System.
   ------------------------------------------------------------------------
   Schema:
     {
       category:      "Short topic tag (shown in review)",
       question:      "The question text",
       options:       ["A", "B", "C", "D"],
       correctAnswer: <index 0..3 of the correct option>
     }
   ========================================================================= */
window.QUESTIONS = [
  // ---- DCS Fundamentals ----
  {
    category: "DCS Fundamentals",
    question: "What does DCS stand for?",
    options: [
      "Digital Control System",
      "Distributed Control System",
      "Direct Communication System",
      "Data Control Station"
    ],
    correctAnswer: 1
  },
  {
    category: "DCS Fundamentals",
    question: "Which architecture best describes a modern DCS?",
    options: [
      "Single centralized controller",
      "Distributed controllers networked together",
      "Standalone PLCs with no network",
      "Manual pneumatic loops"
    ],
    correctAnswer: 1
  },
  {
    category: "DCS Fundamentals",
    question: "Which is NOT typically a part of a DCS?",
    options: [
      "Operator Workstation",
      "Controller",
      "Field I/O",
      "Domestic Wi-Fi Router"
    ],
    correctAnswer: 3
  },
  {
    category: "DCS Fundamentals",
    question: "A DCS is primarily designed for:",
    options: [
      "Discrete manufacturing only",
      "Continuous and batch process control",
      "Office automation",
      "Building HVAC only"
    ],
    correctAnswer: 1
  },

  // ---- Emerson DeltaV ----
  {
    category: "Emerson DeltaV",
    question: "DeltaV is a DCS product manufactured by:",
    options: ["Siemens", "Honeywell", "Emerson", "ABB"],
    correctAnswer: 2
  },
  {
    category: "Emerson DeltaV",
    question: "Which configuration tool is used to build DeltaV control strategies?",
    options: [
      "Control Studio",
      "Step 7",
      "RSLogix",
      "Studio 5000"
    ],
    correctAnswer: 0
  },
  {
    category: "Emerson DeltaV",
    question: "In DeltaV, what is a 'Module'?",
    options: [
      "A hardware I/O card only",
      "A control strategy containing function blocks",
      "A network switch",
      "An operator screen"
    ],
    correctAnswer: 1
  },
  {
    category: "Emerson DeltaV",
    question: "Which network is used between DeltaV controllers and workstations?",
    options: [
      "Profibus DP",
      "DeltaV Control Network (Ethernet-based)",
      "Modbus RTU",
      "HART only"
    ],
    correctAnswer: 1
  },

  // ---- Siemens PCS7 ----
  {
    category: "Siemens PCS7",
    question: "PCS7 is a process control system from:",
    options: ["Emerson", "Yokogawa", "Siemens", "Rockwell"],
    correctAnswer: 2
  },
  {
    category: "Siemens PCS7",
    question: "Which engineering platform is used to configure PCS7?",
    options: [
      "Control Studio",
      "SIMATIC Manager / TIA Portal",
      "Experion PKS",
      "Ovation"
    ],
    correctAnswer: 1
  },
  {
    category: "Siemens PCS7",
    question: "PCS7 typically uses which fieldbus for process I/O?",
    options: ["DeviceNet", "Profibus PA / Profinet", "ControlNet", "CAN open"],
    correctAnswer: 1
  },

  // ---- PLC Basics ----
  {
    category: "PLC Basics",
    question: "What does PLC stand for?",
    options: [
      "Power Line Controller",
      "Programmable Logic Controller",
      "Process Loop Console",
      "Plant Level Computer"
    ],
    correctAnswer: 1
  },
  {
    category: "PLC Basics",
    question: "The most common PLC programming language standardized by IEC 61131-3 is:",
    options: [
      "Ladder Logic",
      "Python",
      "C++",
      "HTML"
    ],
    correctAnswer: 0
  },
  {
    category: "PLC Basics",
    question: "A PLC scan cycle typically includes:",
    options: [
      "Read inputs → execute logic → update outputs",
      "Print logs → reboot → wait",
      "Compile → link → load",
      "Render UI → fetch data → display"
    ],
    correctAnswer: 0
  },

  // ---- HMI ----
  {
    category: "HMI",
    question: "HMI stands for:",
    options: [
      "Human Machine Interface",
      "High Memory Interface",
      "Hybrid Monitoring Instrument",
      "Hardwired Module Indicator"
    ],
    correctAnswer: 0
  },
  {
    category: "HMI",
    question: "A good HMI screen design should:",
    options: [
      "Use bright saturated colors everywhere",
      "Highlight abnormal conditions clearly with muted normal state",
      "Show every available tag at once",
      "Avoid trends and alarms"
    ],
    correctAnswer: 1
  },
  {
    category: "HMI",
    question: "ISA-101 is a standard related to:",
    options: [
      "Cable colors",
      "HMI design for process automation",
      "Pump sizing",
      "Cybersecurity for PLCs"
    ],
    correctAnswer: 1
  },

  // ---- I/O ----
  {
    category: "I/O",
    question: "A 4-20 mA signal is an example of:",
    options: [
      "Digital Input",
      "Analog Input",
      "Pulse Output",
      "Serial Bus"
    ],
    correctAnswer: 1
  },
  {
    category: "I/O",
    question: "Which is a typical Digital Input device?",
    options: [
      "Pressure transmitter",
      "Limit switch",
      "Control valve",
      "Thermocouple"
    ],
    correctAnswer: 1
  },
  {
    category: "I/O",
    question: "An RTD measures:",
    options: [
      "Pressure",
      "Flow",
      "Temperature",
      "Level"
    ],
    correctAnswer: 2
  },

  // ---- Field Devices ----
  {
    category: "Field Devices",
    question: "HART communication is superimposed on which signal?",
    options: [
      "0-10 VDC",
      "4-20 mA",
      "24 VDC discrete",
      "Pneumatic 3-15 psi"
    ],
    correctAnswer: 1
  },
  {
    category: "Field Devices",
    question: "A control valve positioner is used to:",
    options: [
      "Generate alarms",
      "Accurately position the valve stem per the control signal",
      "Measure flow",
      "Provide PLC power"
    ],
    correctAnswer: 1
  },
  {
    category: "Field Devices",
    question: "FOUNDATION Fieldbus and Profibus PA are examples of:",
    options: [
      "Wireless networks",
      "Digital fieldbus protocols for process instrumentation",
      "Operator panel buses",
      "Safety-rated relays"
    ],
    correctAnswer: 1
  },

  // ---- Process Control ----
  {
    category: "Process Control",
    question: "In a PID controller, the 'I' term addresses:",
    options: [
      "Rate of change",
      "Steady-state offset (error over time)",
      "Process noise",
      "Loop gain only"
    ],
    correctAnswer: 1
  },
  {
    category: "Process Control",
    question: "Cascade control is typically used to:",
    options: [
      "Replace PID with on/off control",
      "Improve disturbance rejection using a secondary loop",
      "Reduce the number of transmitters",
      "Avoid using setpoints"
    ],
    correctAnswer: 1
  },
  {
    category: "Process Control",
    question: "A 'setpoint' is:",
    options: [
      "The current measured value of a process variable",
      "The desired target value for a process variable",
      "The high alarm limit",
      "A tuning constant"
    ],
    correctAnswer: 1
  },

  // ---- Alarm Management ----
  {
    category: "Alarm Management",
    question: "ISA-18.2 is a standard for:",
    options: [
      "Cable trays",
      "Alarm management",
      "Loop tuning",
      "Hazardous area classification"
    ],
    correctAnswer: 1
  },
  {
    category: "Alarm Management",
    question: "An 'alarm flood' refers to:",
    options: [
      "A water leak in the control room",
      "Excessive alarms in a short time, overwhelming the operator",
      "Missing alarm sounds",
      "Backup alarm storage full"
    ],
    correctAnswer: 1
  },
  {
    category: "Alarm Management",
    question: "Which is NOT a recommended alarm priority level?",
    options: ["Low", "Medium", "High", "Optional"],
    correctAnswer: 3
  },

  // ---- SIS ----
  {
    category: "SIS",
    question: "SIS stands for:",
    options: [
      "Standard Industrial Software",
      "Safety Instrumented System",
      "Sensor Integration Server",
      "Site Information System"
    ],
    correctAnswer: 1
  },
  {
    category: "SIS",
    question: "SIL stands for:",
    options: [
      "Signal Input Level",
      "Safety Integrity Level",
      "System Inhibit Logic",
      "Standard Interlock Layer"
    ],
    correctAnswer: 1
  },
  {
    category: "SIS",
    question: "IEC 61511 covers:",
    options: [
      "HMI graphics",
      "Functional safety for the process industry",
      "Profinet timing",
      "Cable insulation ratings"
    ],
    correctAnswer: 1
  },
  {
    category: "SIS",
    question: "A SIS is designed to:",
    options: [
      "Optimize production throughput",
      "Take the process to a safe state on demand",
      "Replace the DCS",
      "Generate production reports"
    ],
    correctAnswer: 1
  },

  // ---- Cybersecurity ----
  {
    category: "Cybersecurity",
    question: "IEC 62443 is a standard for:",
    options: [
      "Process safety",
      "Industrial automation and control system cybersecurity",
      "Alarm rationalization",
      "Loop checking"
    ],
    correctAnswer: 1
  },
  {
    category: "Cybersecurity",
    question: "The Purdue Model is used to:",
    options: [
      "Tune PID loops",
      "Define network segmentation levels in ICS environments",
      "Size control valves",
      "Calibrate transmitters"
    ],
    correctAnswer: 1
  },
  {
    category: "Cybersecurity",
    question: "Which is a best practice for DCS cybersecurity?",
    options: [
      "Share operator passwords across shifts",
      "Plug personal USB drives into engineering stations",
      "Segment OT networks from IT and enforce least privilege",
      "Expose controllers directly to the internet"
    ],
    correctAnswer: 2
  },

  // ---- PI System ----
  {
    category: "PI System",
    question: "OSIsoft PI System is primarily used for:",
    options: [
      "Real-time control execution",
      "Plant data historian and analytics",
      "Safety interlocks",
      "Motor starting"
    ],
    correctAnswer: 1
  },
  {
    category: "PI System",
    question: "A 'PI Tag' represents:",
    options: [
      "A physical wire label",
      "A time-series data point stored in the historian",
      "An I/O card slot",
      "A user account"
    ],
    correctAnswer: 1
  },
  {
    category: "PI System",
    question: "Which tool is commonly used to visualize PI System data?",
    options: [
      "PI Vision / PI ProcessBook",
      "AutoCAD",
      "MATLAB Simulink",
      "Microsoft Paint"
    ],
    correctAnswer: 0
  }
];
