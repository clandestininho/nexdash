/**
 * Otimiza e comprime uma imagem no lado do cliente usando HTML5 Canvas.
 * Reduz a imagem para uma resolução máxima mantendo a proporção e converte para Blob JPEG compactado.
 * @param {File} file - Arquivo de imagem original selecionado pelo usuário.
 * @param {number} maxWidth - Largura máxima permitida (padrão: 800).
 * @param {number} maxHeight - Altura máxima permitida (padrão: 800).
 * @param {number} quality - Qualidade da compactação de 0 a 1 (padrão: 0.8).
 * @returns {Promise<Blob>} - Retorna uma Promise que resolve com o Blob da imagem compactada.
 */
export function compressImage(file, maxWidth = 800, maxHeight = 800, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Mantém a proporção da imagem dentro do limite máximo
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('[CompressImage] Erro ao converter canvas para blob.'));
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}
