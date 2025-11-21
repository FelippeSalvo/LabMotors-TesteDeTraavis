// Todos os detalhes dos serviços dos cards:
const serviceData = {
  "revisao-geral": {
    icon: "fas fa-cogs",
    title: "Revisão Geral",
    subtitle: "Check-up completo para sua moto",
    accentText: "PRECISÃO",
    mainText: "ABSOLUTA",
    description: "Nossa revisão geral é um check-up completo de todos os sistemas da sua moto, garantindo segurança e desempenho máximo em cada componente. Realizamos uma análise detalhada e minuciosa.",
    fullDescription: "A revisão geral da LAB Motos é o serviço mais completo que oferecemos. Nossa equipe de mecânicos especializados realiza uma inspeção detalhada de todos os sistemas da sua motocicleta, desde o motor até os componentes elétricos. Garantimos que sua moto esteja em perfeitas condições de uso, identificando possíveis problemas antes que se tornem maiores.",
    heroImage: "images/motoold.jpg",
    detailImage: "images/motorevisao.jpg",
    benefits: [
      "Inspeção completa de todos os sistemas",
      "Verificação de componentes críticos de segurança",
      "Diagnóstico preventivo de problemas",
      "Ajustes e regulagens necessários",
      "Relatório detalhado do estado da moto",
      "Garantia de 90 dias nos serviços realizados"
    ],
    includes: [
      "Verificação do sistema de freios",
      "Análise do motor e transmissão",
      "Checagem elétrica completa",
      "Inspeção de suspensão",
      "Verificação de pneus e rodas",
      "Teste de road test"
    ]
  },
  "suspensao": {
    icon: "fas fa-wrench",
    title: "Suspensão",
    subtitle: "Conforto e estabilidade em qualquer terreno",
    accentText: "CONTROLE",
    mainText: "TOTAL",
    description: "Ajuste e manutenção do sistema de suspensão para conforto e estabilidade superior em qualquer terreno. Trabalhamos com suspensões dianteiras e traseiras.",
    fullDescription: "O sistema de suspensão é fundamental para o conforto e segurança da sua pilotagem. Na LAB Motos, realizamos ajustes precisos e manutenção completa do sistema de suspensão, seja dianteira ou traseira. Nossa equipe tem experiência com todos os tipos de motos, desde esportivas até adventure.",
    heroImage: "images/suspensao.jpg",
    detailImage: "images/suspensao.jpg",
    benefits: [
      "Ajuste personalizado para seu estilo de pilotagem",
      "Melhora significativa no conforto",
      "Maior estabilidade em curvas",
      "Redução de fadiga em viagens longas",
      "Manutenção preventiva de componentes",
      "Teste prático após ajustes"
    ],
    includes: [
      "Revisão completa de bengalas e amortecedores",
      "Troca de óleo das bengalas",
      "Ajuste de pré-carga",
      "Regulagem de compressão e retorno",
      "Verificação de vedadores",
      "Limpeza e lubrificação"
    ]
  },
  "freios": {
    icon: "fas fa-circle",
    title: "Freios",
    subtitle: "Segurança em primeiro lugar",
    accentText: "SEGURANÇA",
    mainText: "MÁXIMA",
    description: "Revisão completa do sistema de freios, essencial para sua segurança. Verificamos pastilhas, discos e fluidos com equipamentos de precisão.",
    fullDescription: "O sistema de freios é o componente mais crítico para sua segurança. Na LAB Motos, utilizamos equipamentos de última geração para garantir que seus freios estejam sempre em perfeitas condições. Trabalhamos com todas as marcas e modelos.",
    heroImage: "images/freio2.jpg",
    detailImage: "images/freio2.jpg",
    benefits: [
      "Verificação completa de pastilhas e discos",
      "Teste de eficiência de frenagem",
      "Troca de fluido de freio quando necessário",
      "Limpeza e lubrificação de pinças",
      "Sangria do sistema hidráulico",
      "Garantia de segurança máxima"
    ],
    includes: [
      "Inspeção visual completa",
      "Medição de espessura de pastilhas",
      "Verificação de discos",
      "Teste de fluido",
      "Ajuste de folgas",
      "Teste de road test"
    ]
  },
  "troca-oleo": {
    icon: "fas fa-oil-can",
    title: "Troca de Óleo",
    subtitle: "Vida longa para seu motor",
    accentText: "QUALIDADE",
    mainText: "GARANTIDA",
    description: "Manutenção periódica com óleos de alta qualidade para prolongar a vida do motor. Usamos apenas óleos premium recomendados pelos fabricantes.",
    fullDescription: "A troca de óleo é uma das manutenções mais importantes para a saúde do seu motor. Na LAB Motos, utilizamos apenas óleos premium das melhores marcas, seguindo rigorosamente as especificações dos fabricantes.",
    heroImage: "images/oleo.jpg",
    detailImage: "images/oleo.jpg",
    benefits: [
      "Óleos premium das melhores marcas",
      "Filtros originais ou equivalentes",
      "Descarte ecológico do óleo usado",
      "Verificação de nível de todos os fluidos",
      "Inspeção geral durante o serviço",
      "Registro de manutenção"
    ],
    includes: [
      "Troca de óleo do motor",
      "Substituição do filtro de óleo",
      "Verificação de vazamentos",
      "Check-up visual completo",
      "Limpeza da área de trabalho",
      "Orientações sobre próxima troca"
    ]
  },
  "sistema-eletrico": {
    icon: "fas fa-bolt",
    title: "Sistema Elétrico",
    subtitle: "Diagnóstico preciso e soluções eficientes",
    accentText: "TECNOLOGIA",
    mainText: "AVANÇADA",
    description: "Diagnóstico e reparo de problemas elétricos com equipamentos de última geração. Solucionamos desde problemas simples até os mais complexos.",
    fullDescription: "Os sistemas elétricos modernos das motos são cada vez mais complexos. Na LAB Motos, contamos com equipamentos de diagnóstico de última geração e profissionais especializados para resolver qualquer problema elétrico.",
    heroImage: "images/eletrica.jpg",
    detailImage: "images/eletrica.jpg",
    benefits: [
      "Diagnóstico com equipamentos de última geração",
      "Reparo de problemas complexos",
      "Teste de bateria e alternador",
      "Verificação de chicotes elétricos",
      "Solução de curtos-circuitos",
      "Garantia nos serviços realizados"
    ],
    includes: [
      "Teste completo do sistema",
      "Verificação de bateria",
      "Análise de alternador",
      "Inspeção de fusíveis",
      "Teste de partida",
      "Relatório de diagnóstico"
    ]
  },
  "corrente-transmissao": {
    icon: "fas fa-gear",
    title: "Corrente e Transmissão",
    subtitle: "Máxima eficiência de potência",
    accentText: "POTÊNCIA",
    mainText: "EFICIENTE",
    description: "Manutenção do sistema de transmissão para máxima eficiência de potência. Trabalhamos com correntes, coroas e pinhões de todas as marcas.",
    fullDescription: "O sistema de transmissão é responsável por transferir a potência do motor para a roda traseira. Na LAB Motos, realizamos manutenção completa deste sistema vital, garantindo máxima eficiência e durabilidade.",
    heroImage: "images/service-chain.jpg",
    detailImage: "images/service-chain.jpg",
    benefits: [
      "Limpeza e lubrificação especializada",
      "Ajuste preciso de tensão",
      "Verificação de desgaste",
      "Substituição quando necessário",
      "Alinhamento de roda traseira",
      "Orientações de manutenção preventiva"
    ],
    includes: [
      "Limpeza profunda da corrente",
      "Lubrificação com produtos específicos",
      "Ajuste de tensão",
      "Verificação de coroa e pinhão",
      "Alinhamento",
      "Teste de funcionamento"
    ]
  },
  "pneus-rodas": {
    icon: "fas fa-circle-notch",
    title: "Pneus e Rodas",
    subtitle: "Segurança e performance em cada curva",
    accentText: "PRECISÃO",
    mainText: "TOTAL",
    description: "Troca e balanceamento de pneus com equipamento de precisão profissional. Trabalhamos com todas as marcas premium do mercado.",
    fullDescription: "Os pneus são o único ponto de contato entre sua moto e o asfalto. Na LAB Motos, oferecemos serviço completo de troca, balanceamento e alinhamento com equipamentos profissionais de alta precisão.",
    heroImage: "images/pneu4.png",
    detailImage: "images/pneu.jpg",
    benefits: [
      "Balanceamento com equipamento de precisão",
      "Pneus das melhores marcas",
      "Montagem profissional",
      "Descarte ecológico dos pneus usados",
      "Verificação de pressão e válvulas",
      "Garantia de instalação"
    ],
    includes: [
      "Desmontagem e montagem",
      "Balanceamento profissional",
      "Instalação de válvulas novas",
      "Calibragem adequada",
      "Verificação de aros",
      "Teste de segurança"
    ]
  },
  "customizacao": {
    icon: "fas fa-paint-brush",
    title: "Customização e Acessórios",
    subtitle: "Personalize sua moto do seu jeito",
    accentText: "ESTILO",
    mainText: "ÚNICO",
    description: "Personalize sua moto com acessórios e modificações de alta qualidade. Realizamos desde instalações simples até projetos completos de customização.",
    fullDescription: "Cada motociclista tem seu estilo único. Na LAB Motos, ajudamos você a personalizar sua moto com acessórios de alta qualidade e modificações profissionais, mantendo sempre a segurança e funcionalidade.",
    heroImage: "images/customizar.jpg",
    detailImage: "images/customizar.jpg",
    benefits: [
      "Consultoria especializada",
      "Instalação profissional",
      "Acessórios de marcas premium",
      "Projetos personalizados",
      "Garantia de instalação",
      "Manutenção de características originais"
    ],
    includes: [
      "Avaliação do projeto",
      "Orçamento detalhado",
      "Instalação de acessórios",
      "Teste de funcionamento",
      "Orientações de uso",
      "Documentação se necessário"
    ]
  }
};

const mainContent = document.getElementById('main-content');
const detailSection = document.getElementById('service-detail');

// Função para mostrar os detalhes dos serviços
function showServiceDetail(serviceId) {
  const service = serviceData[serviceId];
  if (!service || !mainContent || !detailSection) return;

  // Ocultar conteúdo principal
  mainContent.classList.add('d-none');

  // Faz a pagina de detalhes
  const detailHTML = `
    <section class="service-detail-hero position-relative d-flex align-items-center" style="background-image: url('${service.heroImage}');">
      <div class="position-absolute top-0 start-0 w-100 h-100 bg-dark" style="opacity: 0.7;"></div>
      <div class="container position-relative text-white py-5">
        <div class="row">
          <div class="col-lg-8">
            <button onclick="hideServiceDetail()" class="btn btn-lab-outline mb-4">
              <i class="fas fa-arrow-left me-2"></i> VOLTAR
            </button>
            <h1 class="display-4 fw-bold text-uppercase mb-3">${service.title}</h1>
            <p class="lead mb-4">${service.subtitle}</p>
            <div class="mb-4">
              <span class="text-lab-red fw-bold fs-3 me-2">${service.accentText}</span>
              <span class="fw-bold fs-3">${service.mainText}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="py-5 bg-white">
      <div class="container">
        <div class="row align-items-center g-5">
          <div class="col-lg-6">
            <h2 class="h3 fw-bold mb-4">Sobre o Serviço</h2>
            <p class="lead mb-4">${service.description}</p>
            <p>${service.fullDescription}</p>
          </div>
          <div class="col-lg-6">
            <img src="${service.detailImage}" alt="${service.title}" class="img-fluid rounded shadow-lg" />
          </div>
        </div>
      </div>
    </section>

    <section class="py-5 bg-lab-light">
      <div class="container">
        <div class="row g-5">
          <div class="col-lg-6">
            <h3 class="h4 fw-bold mb-4">
              <span class="text-lab-red">Benefícios</span> do Serviço
            </h3>
            <div class="bg-white p-4 rounded shadow-sm">
              ${service.benefits.map(benefit => `
                <div class="service-benefit-item">
                  <i class="fas fa-check-circle mt-1"></i>
                  <span>${benefit}</span>
                </div>
              `).join('')}
            </div>
          </div>
          <div class="col-lg-6">
            <h3 class="h4 fw-bold mb-4">
              <span class="text-lab-red">O que está</span> incluído
            </h3>
            <div class="bg-white p-4 rounded shadow-sm">
              ${service.includes.map(item => `
                <div class="service-benefit-item">
                  <i class="fas fa-wrench mt-1"></i>
                  <span>${item}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="py-5 bg-lab-dark text-white text-center">
      <div class="container">
        <h2 class="display-5 fw-bold mb-4">Pronto para cuidar da sua moto?</h2>
        <p class="lead mb-4">Entre em contato e agende seu serviço agora mesmo</p>
        <a href="../Agenda/index.html" class="nav-link">
        <button class="btn btn-lab-red btn-lg px-5">AGENDAR SERVIÇO</button>
        </a>
      </div>
    </section>

<footer class="modern-footer">
  <div class="container">
    <div class="row">
      <!-- Coluna Marca / Descrição / Social -->
      <div class="footer-brand">
        <a href="../homepage/index.html">
        <img src="../img/Logo.png" alt="LabMotos Logo" class="footer-logo">
        </a>
        <h3>LabMotos</h3>
        <p class="footer-description">
          Paixão por motos e compromisso em elevar o padrão das oficinas, unindo técnica, confiança e transparência.
        </p>
        <div class="footer-social">
          <a href="https://wa.me/31991362050" target="_blank" class="social-icon" aria-label="WhatsApp">
            <!-- WhatsApp SVG -->
            <svg viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.017-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
          </a>
          <a href="https://www.instagram.com/labmotossl" target="_blank" class="social-icon" aria-label="Instagram">
            <!-- Instagram SVG -->
            <svg viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
          </a>
          <a href="https://facebook.com" target="_blank" class="social-icon" aria-label="Facebook">
            <!-- Facebook SVG -->
            <svg viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
          </a>
        </div>
      </div>
      
      <!-- Coluna Links Rápidos -->
      <div>
        <h4 class="footer-title">Links Rápidos</h4>
        <ul class="footer-links">
          <li><a href="../homepage/index.html">Início</a></li>
          <li><a href="../homepage/index.html#quem-somos" class="nav-link">Sobre Nós</a></li>
          <li><a href="#processo">Processo</a></li>
          <li><a href="#clientes">Clientes</a></li>
          <li><a href="#contato">Contato</a></li>
        </ul>
      </div>

      <!-- Coluna Serviços -->
      <div>
        <h4 class="footer-title">Nossos Serviços</h4>
        <ul class="footer-links">
          <li><a href="../servicos/servicos.html">Revisão Geral</a></li>
          <li><a href="../servicos/servicos.html">Suspensão</a></li>
          <li><a href="../servicos/servicos.html">Freios</a></li>
          <li><a href="../servicos/servicos.html">Troca de Óleo</a></li>
          <li><a href="../servicos/servicos.html">Elétrica</a></li>
          <li><a href="../servicos/servicos.html">Transmissão</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span class="copyright">© 2025 LabMotos - Todos os direitos reservados.</span>
    </div>
  </div>
</footer>
  `;

  detailSection.innerHTML = detailHTML;
  detailSection.classList.remove('d-none');
  
  // Volta ao topo
  window.scrollTo(0, 0);
}

// Oculta detalhesss do serviço
function hideServiceDetail() {
  if (!mainContent || !detailSection) return;

  detailSection.classList.add('d-none');
  detailSection.innerHTML = '';
  mainContent.classList.remove('d-none');
  
  window.scrollTo(0, 0);
}

// animação de scrolar
function initScrollReveal() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      }
    });
  }, observerOptions);

  // carrega os elementos aos poucos scrolando
  document.querySelectorAll('.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right').forEach(el => {
    observer.observe(el);
  });
}

// carrega a pagina eo inicializar
document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();
});
