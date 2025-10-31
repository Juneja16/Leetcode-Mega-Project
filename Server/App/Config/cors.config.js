// We need the 'cors' package here to create and export the middleware
import cors from "cors";

// --- 1. Define Production/Strict Options ---
const productionAllowedOrigins = [
  "https://yourproductiondomain.com",
  // Add other production domains/subdomains here
];

const corsOptionsProduction = {
  // This custom function runs for every request in production
  origin: function (origin, callback) {
    // 1. Allow non-browser requests (Postman, curl)
    if (!origin) return callback(null, true);

    // 2. Check against the strict whitelist
    if (productionAllowedOrigins.indexOf(origin) !== -1) {
      callback(null, true); // Allowed
    } else {
      // Denied
      callback(
        new Error(`Origin ${origin} not allowed by CORS for production.`)
      );
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
};

// --- 2. Define Development/Local Options (Less Permissive) ---
const corsOptionsDevelopment = {
  // Explicitly list local origins for better security than 'origin: true'
  origin: [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
};

// --- 3. Export the Environment-Specific Middleware ---
const configureCors = () => {
  if (process.env.NODE_ENV === "production") {
    console.log("CORS: Using Production rules.");
    return cors(corsOptionsProduction);
  } else {
    console.log("CORS: Using Development rules (Localhost only).");
    return cors(corsOptionsDevelopment);
  }
};

export default configureCors;

/* 
CORS SETUP FOR PRODUCtion 

1. Any Frontend Client like POSTMAN, thunderclient,curl Req, Mobile APp  are allowed i.e no Origin Header
Generally used in testing purpose 

2.then if Origin is present then it should be present in Allowed Origins Array else not allowed

CORS SETUP FOR PRODUCtion 
1. if Orgin :true  setup then all with origins headers are allowed thats ok for development mostly
2. but we can  specifically tell which one to allowed so that only from our locally ,frequently used ports
can access that 
 

*/
