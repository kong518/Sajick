import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ResignationFormData } from '../types';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ResignationFormData } from '../types';

export const directPrint = () => {
  try {
    window.print();
  } catch (error) {
    console.warn('Direct window.print() failed:', error);
  }
};

export const printDocuments = (page?: number | string) => {
  directPrint();
};

export const exportToPdf = async (
  formData: ResignationFormData,
  onProgress?: (msg: string) => void
): Promise<boolean> => {
  try {
    onProgress?.('공문서 생성을 준비하는 중입니다...');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageIds = ['print-page-1', 'print-page-2', 'print-page-3'];

    let renderedCount = 0;

    for (let i = 0; i < pageIds.length; i++) {
      const pageId = pageIds[i];
      const el = document.getElementById(pageId);
      if (!el) {
        console.warn(`Element with ID ${pageId} not found in DOM`);
        continue;
      }

      const pageName = i === 0 ? '1페이지: 사직서' : i === 1 ? '2페이지: 동의서' : '3페이지: 업무인수인계서';
      onProgress?.(`${pageName} 고해상도 렌더링 중...`);

      // Small pause to allow styles and fonts to settle
      await new Promise((res) => setTimeout(res, 60));

      const canvas = await html2canvas(el, {
        scale: 2, // 2x high resolution
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 1024,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      if (renderedCount > 0) {
        pdf.addPage();
      }

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, Math.min(pdfHeight, 297));
      renderedCount++;
    }

    if (renderedCount === 0) {
      throw new Error('인쇄할 문서 페이지를 화면에서 찾을 수 없습니다.');
    }

    onProgress?.('PDF 다운로드를 진행하는 중입니다...');
    const filename = `사직서및인수인계서_${formData.name || '활동지원사'}_${formData.resignationDate || '제출'}.pdf`;
    pdf.save(filename);
    return true;
  } catch (error) {
    console.error('Failed to generate PDF:', error);
    return false;
  }
};

export const exportSubmissionJson = (formData: ResignationFormData) => {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(formData, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `사직서데이터_${formData.name}_${formData.id}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
};
