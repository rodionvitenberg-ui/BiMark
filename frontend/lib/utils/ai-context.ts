/**
 * Утилита для сборки XML-контекста текущей страницы для ИИ-ассистента
 */
export function buildPageContext(locale: string, currentPath: string, pageData?: any): string {
  let xmlContext = `<page_context>\n`;
  xmlContext += `  <current_language>${locale}</current_language>\n`;
  xmlContext += `  <current_url>${currentPath}</current_url>\n`;

  // Если мы на странице конкретного ассета/проекта и у нас есть данные
  if (pageData) {
    const isAsset = currentPath.includes('/assets/');
    xmlContext += `  <page_type>${isAsset ? 'asset_detail' : 'project_detail'}</page_type>\n`;
    xmlContext += `  <entity_info>\n`;
    xmlContext += `    <title>${pageData.title?.[locale] || pageData.title || ''}</title>\n`;
    xmlContext += `    <price>$${pageData.price || pageData.price_per_share || ''}</price>\n`;
    
    if (pageData.description) {
      const desc = pageData.description?.[locale] || pageData.description || '';
      // Очищаем от HTML-тегов TinyMCE, чтобы уменьшить расход токенов
      const cleanDesc = desc.replace(/<[^>]*>?/gm, '');
      xmlContext += `    <description>${cleanDesc}</description>\n`;
    }
    
    if (pageData.available_shares) {
      xmlContext += `    <available_shares>${pageData.available_shares}</available_shares>\n`;
    }
    
    xmlContext += `  </entity_info>\n`;
  } else {
    // Общий контекст для остальных страниц
    xmlContext += `  <page_type>general_browsing</page_type>\n`;
  }

  xmlContext += `</page_context>`;
  return xmlContext;
}