# link-shortener-api
> A simple link shortener API

## Prerequisites

- [Bun](https://bun.sh)
> I used [bun](https://bun.sh) in this project to install and manage dependencies.
- [Docker](https://www.docker.com)


## Getting Started
1. Clone the repository
```bash
git clone https://github.com/meiazero/link-shortener-api && cd link-shortener-api
```

2. Install dependencies
```bash
bun install
```

3. Create a `.env` file in the root of the project copy the content of `.env.example` and replace the values with your own.

4. Run the development server
```bash
bun dev
```


## API Endpoints

### POST `/create-link`
Create a new short link
```json
{
	"code": "example",
	"url": "https://example.com"
}
```

### GET `/:code`
Redirect to the original link

### GET `/links`
Get all links

### GET `/analytics`
Get all links analytics

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.