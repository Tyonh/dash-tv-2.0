# Dashboard TV 2.0

Painel corporativo para TV: ranking de vendedores, positivação, pódio, mapa com radar de clima e notícias do IBGE.
É um site estático (HTML + CSS + JS), sem build. Os dados vêm de planilhas do Google publicadas como CSV.

## Estrutura

```
dash-tv-2.0/
├── site/                     ← pasta servida pelo servidor web
│   ├── index.html
│   ├── css/style.css
│   ├── js/script.js
│   ├── img/                  ← fotos dos vendedores (Nome.png, igual ao nome na planilha)
│   ├── config.example.json   ← modelo da configuração
│   └── config.json           ← chave da OpenWeather (NÃO vai pro git, criar na VPS)
├── deploy/nginx/dash-tv.conf ← configuração do Nginx
├── docker-compose.yml        ← sobe o painel com Docker
└── README.md
```

## Deploy na VPS (com Docker, recomendado)

Pré-requisitos: Docker e Docker Compose instalados na VPS.

```bash
# 1. Baixar o projeto
git clone <URL_DO_REPOSITORIO> /opt/dash-tv
cd /opt/dash-tv

# 2. Criar a configuração com a chave da OpenWeather
cp site/config.example.json site/config.json
nano site/config.json

# 3. Subir (porta 8080 por padrão)
docker compose up -d

# Outra porta:  DASH_PORT=80 docker compose up -d
```

Acesse `http://IP_DA_VPS:8080` no navegador da TV.

### Atualizar

```bash
cd /opt/dash-tv
git pull
```

Não precisa reiniciar o container: a pasta `site/` é montada direto. A TV pega a versão nova no próximo recarregamento.
Só reinicie (`docker compose restart`) se mudar `deploy/nginx/dash-tv.conf`.

### Comandos úteis

```bash
docker compose ps        # status
docker compose logs -f   # logs
docker compose down      # parar
```

## Deploy sem Docker (Nginx direto na VPS)

```bash
sudo apt install nginx
sudo git clone <URL_DO_REPOSITORIO> /var/www/dash-tv
sudo cp /var/www/dash-tv/site/config.example.json /var/www/dash-tv/site/config.json
sudo nano /var/www/dash-tv/site/config.json

sudo cp /var/www/dash-tv/deploy/nginx/dash-tv.conf /etc/nginx/sites-available/dash-tv
# Edite: root /var/www/dash-tv/site;   e   server_name seu-dominio-ou-ip;
sudo nano /etc/nginx/sites-available/dash-tv
sudo ln -s /etc/nginx/sites-available/dash-tv /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

## HTTPS (opcional, se tiver domínio)

Com Nginx direto na VPS: `sudo apt install certbot python3-certbot-nginx && sudo certbot --nginx -d seu-dominio`.
Com Docker: coloque um proxy reverso na frente (Nginx/Caddy/Traefik da VPS) apontando para `127.0.0.1:8080`.

## Desenvolvimento local

Abra a pasta `site/` com o Live Server do VS Code, ou rode `docker compose up`.

## Observações

- **Chave da OpenWeather:** o navegador baixa o `config.json`, então a chave fica visível para quem acessar o painel.
  Use uma chave gratuita só para esse fim e evite deixar o painel aberto na internet sem necessidade
  (restrinja por firewall/IP da empresa, se possível). Sem chave, o mapa usa um radar simulado.
- **Fotos:** o arquivo em `site/img/` precisa ter exatamente o mesmo nome da planilha (ex.: `Bruno.png`).
- **Dados:** as URLs das planilhas ficam no topo de `site/js/script.js` (`SHEET_URLS`).
