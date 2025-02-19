import express from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

function generateCardNumber(bin) {
    let desiredLength;

    // Determine desired length based on BIN
    if (bin.startsWith('34') || bin.startsWith('37')) {
        desiredLength = 15; // American Express
    } else if (['5018', '5020', '5038', '5893', '6304', '6759', '6761', '6762', '6763'].some(prefix => bin.startsWith(prefix))) {
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
    return cardNumber.startsWith('34') || cardNumber.startsWith('37')
        ? Math.floor(Math.random() * 9000) + 1000  // 4-digit CVV for Amex
        : Math.floor(Math.random() * 900) + 100;   // 3-digit CVV for others
}

app.get('/generate/:bin', (req, res) => {
    try {
        const bin = req.params.bin;
        
        // Validate BIN
        if (!/^\d{6,8}$/.test(bin)) {
            return res.status(400).json({ error: 'Invalid BIN. Must be 6-8 digits.' });
        }

        const cardNumber = generateCardNumber(bin);
        const cvv = generateCVV(cardNumber);
        
        // Generate expiry date (current year + 3 years)
        const currentDate = new Date();
        const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
        const year = String(currentDate.getFullYear() + 3);

        res.json({
            number: cardNumber,
            month: month,
            year: year,
            cvv: String(cvv)
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/', (req, res) => {
    res.json({ message: "by pixel" });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});