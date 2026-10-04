/* Настройки отправки. Меняется только адрес приёмника.
   Пока endpoint пустой — бриф не отправляется, а предлагает скачать файл с ответами.
   Сюда вписывается адрес Cloudflare Worker, например:
   endpoint: 'https://brief-bot.ваш-логин.workers.dev'
*/
window.BRIEF_CONFIG = {
  endpoint: ''
};
