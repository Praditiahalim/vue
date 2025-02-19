// import express from "express";
// import cors from "cors";
// import fetch from "node-fetch";

// const app = express();
// const port = process.env.PORT || 3001;

// app.use(cors());
// app.use(express.json());

// // Parse URL-encoded bodies
// app.use(express.urlencoded({ extended: true }));

// const API_KEY = "pixelme11@@@";

// const validateApiKey = (req, res, next) => {
//   const apiKey = req.headers["x-api-key"];

//   if (!apiKey || apiKey !== API_KEY) {
//     return res.status(401).json({ error: "Invalid or missing API key" });
//   }

//   next();
// };

// function generateCardNumber(bin) {
//   let desiredLength;

//   // Determine desired length based on BIN
//   if (bin.startsWith("34") || bin.startsWith("37")) {
//     desiredLength = 15; // American Express
//   } else if (
//     [
//       "5018",
//       "5020",
//       "5038",
//       "5893",
//       "6304",
//       "6759",
//       "6761",
//       "6762",
//       "6763",
//     ].some((prefix) => bin.startsWith(prefix))
//   ) {
//     desiredLength = 19; // Some Maestro cards
//   } else {
//     desiredLength = 16; // Most other cards (Visa, Mastercard, etc.)
//   }

//   let cardNumber = bin;
//   while (cardNumber.length < desiredLength - 1) {
//     cardNumber += Math.floor(Math.random() * 10);
//   }

//   let sum = 0;
//   let alternate = false;
//   for (let i = cardNumber.length - 1; i >= 0; i--) {
//     let n = parseInt(cardNumber.charAt(i));
//     if (alternate) {
//       n *= 2;
//       if (n > 9) {
//         n = (n % 10) + 1;
//       }
//     }
//     sum += n;
//     alternate = !alternate;
//   }
//   let checkDigit = (10 - (sum % 10)) % 10;
//   return cardNumber + checkDigit;
// }

// function generateCVV(cardNumber) {
//   return cardNumber.startsWith("34") || cardNumber.startsWith("37")
//     ? Math.floor(Math.random() * 9000) + 1000 // 4-digit CVV for Amex
//     : Math.floor(Math.random() * 900) + 100; // 3-digit CVV for others
// }

// app.get("/generate/:bin/:quantity?", validateApiKey, (req, res) => {
//   try {
//     const bin = req.params.bin;
//     const quantity = parseInt(req.params.quantity) || 1;

//     // Validate BIN
//     if (!/^\d{4,8}$/.test(bin)) {
//       return res
//         .status(400)
//         .json({ error: "Invalid BIN. Must be 6-8 digits." });
//     }

//     // Validate quantity
//     if (isNaN(quantity) || quantity < 1 || quantity > 100) {
//       return res
//         .status(400)
//         .json({ error: "Invalid quantity. Must be between 1 and 100." });
//     }

//     const cards = [];
//     for (let i = 0; i < quantity; i++) {
//       const cardNumber = generateCardNumber(bin);
//       const cvv = generateCVV(cardNumber);

//       // Random month between 01-12
//       const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, "0");
//       // Random year between current and current + 10
//       const currentYear = new Date().getFullYear();
//       const year = String(currentYear + Math.floor(Math.random() * 10));

//       cards.push({
//         number: cardNumber,
//         month: month,
//         year: year,
//         cvv: String(cvv),
//       });
//     }

//     res.json(cards);
//   } catch (error) {
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// async function getBinInfo(bin) {
//   try {
//     const response = await fetch(`https://bins.antipublic.cc/bins/${bin}`);
//     const data = await response.json();
//     return data;
//   } catch (error) {
//     console.error("Error fetching BIN info:", error);
//     return null;
//   }
// }

// function getValidExpirationDate(requestedMonth, requestedYear) {
//   const currentDate = new Date();
//   const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-based
//   const currentYear = currentDate.getFullYear();

//   // If no specific date requested, generate random future date
//   if (!requestedMonth || !requestedYear) {
//     const randomYear = currentYear + Math.floor(Math.random() * 9);
//     const randomMonth = Math.floor(Math.random() * 12) + 1;
//     return {
//       month: String(randomMonth).padStart(2, "0"),
//       year: String(randomYear),
//     };
//   }

//   let month = parseInt(requestedMonth);
//   let year = parseInt(requestedYear);

//   // Check if requested date is in the past
//   if (year < currentYear || (year === currentYear && month < currentMonth)) {
//     // Adjust to next valid date
//     if (month < currentMonth) {
//       month = currentMonth;
//       year = currentYear;
//     } else {
//       month = currentMonth;
//       year = currentYear + 1;
//     }
//   }

//   return {
//     month: String(month).padStart(2, "0"),
//     year: String(year),
//   };
// }

// app.post("/generate", validateApiKey, (req, res) => {
//   try {
//     const {
//       bin,
//       quantity,
//       includeDate,
//       includeCSV,
//       month,
//       year,
//       csv,
//       format = "json",
//     } = req.body;

//     const amount = parseInt(quantity);

//     // Validate BIN
//     if (!/^\d{4,8}$/.test(bin)) {
//       return res
//         .status(400)
//         .json({ error: "Invalid BIN. Must be 6-8 digits." });
//     }

//     // Validate amount
//     if (isNaN(amount) || amount < 1 || amount > 100) {
//     }
//     if (isNaN(amount) || amount < 1 || amount > 1000) {
//       return res
//         .status(400)
//         .json({ error: "Invalid amount. Must be between 1 and 100." });
//     }

//     const cards = [];
//     for (let i = 0; i < amount; i++) {
//       const cardNumber = generateCardNumber(bin);
//       const card = {
//         number: cardNumber,
//       };

//       if (includeDate) {
//         const expDate = getValidExpirationDate(month, year);
//         card.month = expDate.month;
//         card.year = expDate.year;
//       }

//       if (includeCSV) {
//         card.cvv = csv || generateCVV(cardNumber);
//       }

//       // Remove undefined properties
//       Object.keys(card).forEach(
//         (key) => card[key] === undefined && delete card[key]
//       );

//       cards.push(card);
//     }

//     let result;
//     switch (format) {
//       case "pipe":
//         result = cards.map((c) => Object.values(c).join("|")).join("\n");
//         break;
//       case "json":
//       default:
//         result = cards;
//     }

//     res.json({ success: true, result });
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// app.get("/check/bin/:number", validateApiKey, async (req, res) => {
//   try {
//     const number = req.params.number;

//     // Extract first 6 digits as BIN
//     const bin = number.substring(0, 6);

//     // Validate BIN format
//     if (!/^\d{6}/.test(bin)) {
//       return res
//         .status(400)
//         .json({
//           error: "Invalid card number. Must start with 6 digits for BIN.",
//         });
//     }

//     const binInfo = await getBinInfo(bin);
//     if (!binInfo) {
//       return res.status(404).json({ error: "BIN information not found" });
//     }

//     res.json(binInfo);
//   } catch (error) {
//     console.error("Error checking BIN:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// app.get("/", (req, res) => {
//   res.json({ message: "by pixel" });
// });

// const server = app.listen(port, () => {
//   console.log(`Server running on port ${port}`);
// });

import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

const API_KEY = "pixelme11@@@";

const validateApiKey = (req, res, next) => {
  const apiKey = req.headers["x-api-key"];

  if (!apiKey || apiKey !== API_KEY) {
    return res.status(401).json({ error: "Invalid or missing API key" });
  }

  next();
};

function generateCardNumber(bin) {
  let desiredLength;

  // Determine desired length based on BIN
  if (bin.startsWith("34") || bin.startsWith("37")) {
    desiredLength = 15; // American Express
  } else if (
    [
      "5018",
      "5020",
      "5038",
      "5893",
      "6304",
      "6759",
      "6761",
      "6762",
      "6763",
    ].some((prefix) => bin.startsWith(prefix))
  ) {
    desiredLength = 19; // Some Maestro cards
  } else {
    desiredLength = 16; // Most other cards (Visa, Mastercard, etc.)
  }

  let cardNumber = bin;
  while (cardNumber.length < desiredLength - 1) {
    cardNumber += Math.floor(Math.random() * 10);
  }

  let sum = 0;
  let alternate = false;
  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let n = parseInt(cardNumber.charAt(i));
    if (alternate) {
      n *= 2;
      if (n > 9) {
        n = (n % 10) + 1;
      }
    }
    sum += n;
    alternate = !alternate;
  }
  let checkDigit = (10 - (sum % 10)) % 10;
  return cardNumber + checkDigit;
}

function generateCVV(cardNumber) {
  return cardNumber.startsWith("34") || cardNumber.startsWith("37")
    ? Math.floor(Math.random() * 9000) + 1000 // 4-digit CVV for Amex
    : Math.floor(Math.random() * 900) + 100; // 3-digit CVV for others
}

app.get("/generate/:bin/:quantity?", validateApiKey, (req, res) => {
  try {
    const bin = req.params.bin;
    const quantity = parseInt(req.params.quantity) || 1;

    // Validate BIN
    if (!/^\d{4,8}$/.test(bin)) {
      return res
        .status(400)
        .json({ error: "Invalid BIN. Must be 6-8 digits." });
    }

    // Validate quantity
    if (isNaN(quantity) || quantity < 1 || quantity > 100) {
      return res
        .status(400)
        .json({ error: "Invalid quantity. Must be between 1 and 100." });
    }

    const cards = [];
    for (let i = 0; i < quantity; i++) {
      const cardNumber = generateCardNumber(bin);
      const cvv = generateCVV(cardNumber);

      // Random month between 01-12
      const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, "0");
      // Random year between current and current + 10
      const currentYear = new Date().getFullYear();
      const year = String(currentYear + Math.floor(Math.random() * 10));

      cards.push({
        number: cardNumber,
        month: month,
        year: year,
        cvv: String(cvv),
      });
    }

    res.json(cards);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

async function getBinInfo(bin) {
  try {
    const response = await fetch(`https://bins.antipublic.cc/bins/${bin}`);
    let data = await response.json();

    // Add flag emoji if country exists
    if (data.country) {
      data.country_flag = countryCodeToFlag(data.country);
    }

    return data;
  } catch (error) {
    console.error("Error fetching BIN info:", error);
    return null;
  }
}

function countryCodeToFlag(countryCode) {
  if (!countryCode || typeof countryCode !== "string") return "";

  // Convert country code to uppercase
  countryCode = countryCode.toUpperCase();

  // Convert each letter to their regional indicator symbol
  const base = 127397; // This is the offset to convert ASCII letters to regional indicator symbols
  const flagEmoji = String.fromCodePoint(
    ...[...countryCode].map((c) => c.charCodeAt(0) + base)
  );

  return flagEmoji;
}

function getValidExpirationDate(requestedMonth, requestedYear) {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-based
  const currentYear = currentDate.getFullYear();

  // If no specific date requested, generate random future date
  if (!requestedMonth || !requestedYear) {
    const randomYear = currentYear + Math.floor(Math.random() * 9);
    const randomMonth = Math.floor(Math.random() * 12) + 1;
    return {
      month: String(randomMonth).padStart(2, "0"),
      year: String(randomYear),
    };
  }

  let month = parseInt(requestedMonth);
  let year = parseInt(requestedYear);

  // Check if requested date is in the past
  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    // Adjust to next valid date
    if (month < currentMonth) {
      month = currentMonth;
      year = currentYear;
    } else {
      month = currentMonth;
      year = currentYear + 1;
    }
  }

  return {
    month: String(month).padStart(2, "0"),
    year: String(year),
  };
}

app.post("/generate", validateApiKey, (req, res) => {
  try {
    const {
      bin,
      quantity,
      includeDate,
      includeCSV,
      month,
      year,
      csv,
      format = "json",
    } = req.body;

    const amount = parseInt(quantity);

    // Validate BIN
    if (!/^\d{4,8}$/.test(bin)) {
      return res
        .status(400)
        .json({ error: "Invalid BIN. Must be 6-8 digits." });
    }

    // Validate amount
    if (isNaN(amount) || amount < 1 || amount > 100) {
    }
    if (isNaN(amount) || amount < 1 || amount > 1000) {
      return res
        .status(400)
        .json({ error: "Invalid amount. Must be between 1 and 100." });
    }

    const cards = [];
    for (let i = 0; i < amount; i++) {
      const cardNumber = generateCardNumber(bin);
      const card = {
        number: cardNumber,
      };

      if (includeDate) {
        const expDate = getValidExpirationDate(month, year);
        card.month = expDate.month;
        card.year = expDate.year;
      }

      if (includeCSV) {
        card.cvv = csv || generateCVV(cardNumber);
      }

      // Remove undefined properties
      Object.keys(card).forEach(
        (key) => card[key] === undefined && delete card[key]
      );

      cards.push(card);
    }

    let result;
    switch (format) {
      case "pipe":
        result = cards.map((c) => Object.values(c).join("|")).join("\n");
        break;
      case "json":
      default:
        result = cards;
    }

    res.json({ success: true, result });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/check/bin/:number", validateApiKey, async (req, res) => {
  try {
    const number = req.params.number;

    // Extract first 6 digits as BIN
    const bin = number.substring(0, 6);

    // Validate BIN format
    if (!/^\d{6}/.test(bin)) {
      return res
        .status(400)
        .json({
          error: "Invalid card number. Must start with 6 digits for BIN.",
        });
    }

    const binInfo = await getBinInfo(bin);
    if (!binInfo) {
      return res.status(404).json({ error: "BIN information not found" });
    }

    res.json(binInfo);
  } catch (error) {
    console.error("Error checking BIN:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/", (req, res) => {
  res.json({ message: "by pixel" });
});

const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
