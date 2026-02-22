# Stock Management System

A modern, responsive inventory management system with barcode scanning, shopping cart functionality, and integrated payment processing. Built with React, TypeScript, and Material-UI with a Python FastAPI backend.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue)](https://www.docker.com/)
[![React](https://img.shields.io/badge/React-19.1-61dafb)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6)](https://www.typescriptlang.org/)

## Features

### ✨ Core Functionality

- **📱 Barcode Scanner** - Real-time barcode/QR code scanning with html5-qrcode
- **🛒 Shopping Cart** - Add, remove, and manage inventory items
- **💳 Payment Integration** - Integrated Payconiq QR payment system
- **🎨 Modern UI** - Material-UI components with smooth animations
- **🌓 Dark/Light Mode** - Theme switching with View Transitions API
- **📱 Responsive Design** - Optimized for desktop, tablet, and mobile devices

### 🎯 Enhanced UX

- **✅ Toast Notifications** - Real-time feedback with success, error, warning, and info states
- **🎬 Smooth Animations** - Bounce-in cart items, slide-out removal animations
- **🏷️ Icon Integration** - Visual indicators throughout the interface
- **📊 Professional Footer** - Quick links, system info, and branding
- **⚡ Fast Performance** - Built with Vite for optimal performance

## Tech Stack

### Frontend

- **React 19.1** - UI framework
- **TypeScript 5.8** - Type safety
- **Material-UI (MUI) 5.15** - Component library
- **Vite 7.1** - Build tool
- **html5-qrcode 2.3.8** - Barcode/QR code scanning

### Backend

- **Python FastAPI** - High-performance API framework
- **InvenTree** - Inventory management system
- **PostgreSQL** - Database
- **Caddy** - Reverse proxy & SSL

### DevOps

- **Docker & Docker Compose** - Containerization

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for local development)
- Python 3.9+ (for backend development)

### Using Docker (Recommended)

1. **Clone the repository**

   ```bash
   git clone https://github.com/maakleerplek/stock-management.git
   cd stock-management
   ```

2. **Start the application**

   ```bash
   docker compose up -d --build
   ```

3. **Access the application**

   Based on the IP address configured in your `.env` file (e.g., `SITE_IP=10.72.3.141` and `INVENTREE_SITE_URL="https://10.72.3.141:8443"`), you can access the applications as follows:

   **Stock App:**
   - `https://stock.localhost` (Locally)
   - `https://<YOUR_SITE_IP>` (e.g., [https://10.72.3.141](https://10.72.3.141)) (Network)

   **InvenTree:**
   - Access via the exact URL defined in `INVENTREE_SITE_URL` (e.g., [https://10.72.3.141:8443](https://10.72.3.141:8443))

   > **Note:** Because these are local network addresses, your browser will likely show a warning about the connection not being private (`ERR_CERT_AUTHORITY_INVALID`). This is normal because Caddy generates its own local HTTPS certificates. You can safely click "Advanced" and then "Proceed" to bypass the warning.

### Local Development

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

#### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
python main.py
```

## Project Structure

```
gev/
├── frontend/                    # React TypeScript application
│   ├── src/
│   │   ├── App.tsx             # Main app component
│   │   ├── BarcodeScannerContainer.tsx
│   │   ├── ShoppingWindow.tsx
│   │   ├── AddPartForm.tsx
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── ToastContext.tsx    # Notification system
│   │   ├── VolunteerContext.tsx
│   │   ├── theme.ts            # MUI theme config
│   │   ├── sendCodeHandler.tsx # API communication
│   │   └── assets/             # Images and SVGs
│   ├── Dockerfile
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                     # Python FastAPI backend
│   ├── main.py                 # API server with endpoints
│   ├── inventree_client.py     # InvenTree API client
│   ├── test_backend.py
│   ├── Dockerfile
│   └── requirements.txt
│
├── inventree-configs/           # InvenTree configuration files
│
├── logs/                        # Application logs
│
├── docker-compose.yml          # Multi-container orchestration
├── Caddyfile                   # Reverse proxy configuration
├── README.md                   # Project documentation
├── DEPLOYMENT_CHECKLIST.md
├── BACKEND_PROTECTION.md
└── Various IMAGE_*.md files    # Image system documentation
```

## API Endpoints

### Items

- `POST /get-item-from-qr` - Fetch item by barcode/QR code
- `GET /get-thumbnail/{part_id}` - Get item thumbnail image
- `POST /take-item` - Remove item from stock (checkout)

### Request/Response Examples

**Scan Item:**

```bash
curl -X POST http://localhost:8001/get-item-from-qr \
  -H "Content-Type: application/json" \
  -d '{"qr_id": "ABC123"}'
```

**Checkout:**

```bash
curl -X POST http://localhost:8001/take-item \
  -H "Content-Type: application/json" \
  -d '{"itemId": 5, "quantity": 2}'
```

## Features in Detail

### 🎨 UI/UX Enhancements

- **Animated Cart Items** - Items bounce in when added, slide out when removed
- **Icon Buttons** - Visual indicators for scanner, payment, and actions
- **Professional Footer** - Company info, quick links, and system status
- **Toast Notifications** - Non-intrusive alerts for user feedback
- **Theme Support** - Auto-detect system preference or manual toggle

### 📱 Mobile Optimization

- Touch-friendly button sizes
- Responsive grid layout
- Optimized for landscape and portrait modes
- Fast barcode scanning on mobile devices

### ♿ Accessibility

- WCAG 2.1 compliant colors
- Semantic HTML structure
- Keyboard navigation support
- ARIA labels on interactive elements

### Theme Customization

Edit `frontend/src/theme.ts` to modify:

- Primary and secondary colors
- Typography settings
- Component styling
- Dark/light mode palettes

## Development

### Running Tests

```bash
cd frontend
npm run test
```

### Linting

```bash
cd frontend
npm run lint
```

### Building for Production

```bash
cd frontend
npm run build
```

## Troubleshooting

### Docker Issues

```bash
# Check container status
docker compose ps

# View logs
docker compose logs -f frontend
docker compose logs -f backend

# Restart containers
docker compose restart
```

### Frontend Not Connecting to Backend

1. Verify `VITE_BACKEND_URL` is set correctly
2. Ensure backend is running: `docker compose ps`
3. Check CORS settings in backend `main.py`
4. Check browser console for detailed errors

### Barcode Scanner Not Working

1. Ensure HTTPS is enabled (required by browsers)
2. Grant camera permission in browser
3. Check browser compatibility (needs getUserMedia support)
4. Test with different QR codes

## Performance Tips

- Use Docker for consistent environment
- Enable browser caching for static assets
- Compress images for item thumbnails
- Use CDN for media files in production

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Standards

- Use TypeScript for type safety
- Follow Material-UI component patterns
- Add tests for new features
- Update documentation

## Roadmap

- Android mobile app if possible
- Using feedback from users to improve the webapp

### Current Status ✅

- ✅ Barcode scanning
- ✅ Item display and management
- ✅ Item removal (checkout)
- ✅ Shopping cart feature
- ✅ Payment integration (Payconiq)
- ✅ Mobile responsiveness
- ✅ Dark/Light theme
- ✅ Toast notifications

### Planned Features 🚀

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For issues, questions, or suggestions:

- Create an [Issue](https://github.com/maakleerplek/stock-management/issues)
- Start a [Discussion](https://github.com/maakleerplek/stock-management/discussions)
- Contact: [Maakleerplek VZW](https://maakleerplek.be)

## Acknowledgments

- [InvenTree](https://inventree.org/) - Inventory management system
- [Material-UI](https://mui.com/) - Component library
- [React](https://react.dev/) - JavaScript library
- [FastAPI](https://fastapi.tiangolo.com/) - Backend framework
- [html5-qrcode](https://github.com/mebjas/html5-qrcode) - QR code scanning

---

\*\*Made with ❤️ by [Maakleerplek VZW](https://maakleerplek.be) | High Tech Lab
