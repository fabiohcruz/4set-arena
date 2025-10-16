const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Capturar erros do console
  const consoleMessages = [];
  page.on('console', msg => {
    consoleMessages.push({
      type: msg.type(),
      text: msg.text()
    });
  });
  
  // Capturar erros de rede
  const networkErrors = [];
  page.on('requestfailed', request => {
    networkErrors.push({
      url: request.url(),
      failure: request.failure()
    });
  });
  
  // Capturar respostas
  const responses = [];
  page.on('response', response => {
    responses.push({
      url: response.url(),
      status: response.status(),
      statusText: response.statusText()
    });
  });
  
  try {
    // Primeiro fazer login
    console.log('🔐 Fazendo login...');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2' });
    
    // Preencher formulário de login
    await page.type('input[type="text"]', 'admin');
    await page.type('input[type="password"]', 'admin');
    await page.click('button[type="submit"]');
    
    // Aguardar redirecionamento
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 });
    
    console.log('✅ Login realizado');
    
    // Navegar para página de menu
    console.log('📋 Acessando página de menu...');
    await page.goto('http://localhost:3000/configuracoes/menu', { waitUntil: 'networkidle2', timeout: 15000 });
    
    // Aguardar um pouco para capturar todos os logs
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Imprimir resultados
    console.log('\n=== MENSAGENS DO CONSOLE ===');
    consoleMessages.forEach(msg => {
      console.log(`[${msg.type.toUpperCase()}] ${msg.text}`);
    });
    
    console.log('\n=== ERROS DE REDE ===');
    if (networkErrors.length > 0) {
      networkErrors.forEach(err => {
        console.log(`URL: ${err.url}`);
        console.log(`Erro: ${JSON.stringify(err.failure)}`);
      });
    } else {
      console.log('Nenhum erro de rede encontrado');
    }
    
    console.log('\n=== RESPOSTAS 4XX/5XX ===');
    const errorResponses = responses.filter(r => r.status >= 400);
    if (errorResponses.length > 0) {
      errorResponses.forEach(r => {
        console.log(`[${r.status}] ${r.url} - ${r.statusText}`);
      });
    } else {
      console.log('Nenhuma resposta com erro encontrada');
    }
    
    // Capturar conteúdo da página
    const pageContent = await page.content();
    const hasMenuItems = pageContent.includes('Nenhum item encontrado');
    const hasError = pageContent.includes('Erro ao carregar');
    const hasLoading = pageContent.includes('Carregando');
    
    console.log('\n=== STATUS DA PÁGINA ===');
    console.log('Mostra "Nenhum item encontrado":', hasMenuItems);
    console.log('Mostra "Erro ao carregar":', hasError);
    console.log('Mostra "Carregando":', hasLoading);
    
  } catch (error) {
    console.error('Erro ao executar teste:', error);
  } finally {
    await browser.close();
  }
})();

