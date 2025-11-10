// Constantes para eliminar números mágicos
const USER_VALUE_LIMIT = 500;
const PRIORITY_THRESHOLD = 1000;

// Strategy Pattern para formatação de relatórios
class CSVFormatter {
  generateHeader() {
    return 'ID,NOME,VALOR,USUARIO\n';
  }

  generateItemRow(item, userName, isPriority) { // eslint-disable-line no-unused-vars
    return `${item.id},${item.name},${item.value},${userName}\n`;
  }

  generateFooter(total) {
    return `\nTotal,,\n${total},,\n`;
  }
}

class HTMLFormatter {
  generateHeader(userName) {
    return `<html><body>
<h1>Relatório</h1>
<h2>Usuário: ${userName}</h2>
<table>
<tr><th>ID</th><th>Nome</th><th>Valor</th></tr>\n`;
  }

  generateItemRow(item, userName, isPriority) {
    const style = isPriority ? ' style="font-weight:bold;"' : '';
    return `<tr${style}><td>${item.id}</td><td>${item.name}</td><td>${item.value}</td></tr>\n`;
  }

  generateFooter(total) {
    return `</table>
<h3>Total: ${total}</h3>
</body></html>\n`;
  }
}

export class ReportGenerator {
  constructor(database) {
    this.db = database;
    this.formatters = {
      CSV: new CSVFormatter(),
      HTML: new HTMLFormatter(),
    };
  }

  /**
   * Gera um relatório de itens baseado no tipo e no usuário.
   * - Admins veem tudo.
   * - Users comuns só veem itens com valor <= 500.
   */
  generateReport(reportType, user, items) {
    const formatter = this.formatters[reportType];
    const filteredItems = this.filterItemsByUserRole(user, items);
    const total = this.calculateTotal(filteredItems);

    return this.buildReport(formatter, user, filteredItems, total);
  }

  // Extract Method: Separar a lógica de filtragem
  filterItemsByUserRole(user, items) {
    if (user.role === 'ADMIN') {
      return this.processAdminItems(items);
    }
    
    if (user.role === 'USER') {
      return this.processUserItems(items);
    }

    return [];
  }

  // Extract Method: Processar itens para Admin
  processAdminItems(items) {
    return items.map((item) => {
      const processedItem = { ...item };
      if (item.value > PRIORITY_THRESHOLD) {
        processedItem.priority = true;
      }
      return processedItem;
    });
  }

  // Extract Method: Processar itens para User comum
  processUserItems(items) {
    return items.filter((item) => item.value <= USER_VALUE_LIMIT);
  }

  // Extract Method: Calcular total
  calculateTotal(items) {
    return items.reduce((sum, item) => sum + item.value, 0);
  }

  // Extract Method: Construir o relatório completo
  buildReport(formatter, user, items, total) {
    let report = '';

    // Gerar cabeçalho
    report += formatter.generateHeader(user.name);

    // Gerar linhas dos itens
    for (const item of items) {
      const isPriority = item.priority || false;
      report += formatter.generateItemRow(item, user.name, isPriority);
    }

    // Gerar rodapé
    report += formatter.generateFooter(total);

    return report.trim();
  }
}
