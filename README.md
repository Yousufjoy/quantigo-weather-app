Follow these steps to run the project locally:

1. Clone the repository
git clone https://github.com/Yousufjoy/quantigo-weather-app.git

Install dependencies

If you’re using Bun:
bun install


Or use your preferred package manager:

npm install
or
yarn install
or
pnpm install


Configure environment variables

2. Create a .env.local file in the root directory and add the following:

NEXT_PUBLIC_OPENWEATHER_API_KEY=9d729cfd40c256defac28e6a8266b774
NEXT_PUBLIC_OPENWEATHER_BASE_URL=https://api.openweathermap.org/data/2.5


3. Run the development server

With Bun:
bun run dev


Or with npm/yarn/pnpm:

npm run dev
or
yarn dev
or
pnpm dev

4. Open in browser


Once the server is running, open:
 http://localhost:3000/