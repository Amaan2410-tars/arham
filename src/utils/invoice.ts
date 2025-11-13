import jsPDF from 'jspdf'

interface InvoiceData {
  invoiceNo: string
  orderId: string
  customerName: string
  phone: string
  address: string
  items: Array<{
    name: string
    price: number
    quantity: number
  }>
  subtotal: number
  gst: number
  total: number
  paymentMode: string
}

export function generateInvoicePDF(data: InvoiceData): Blob {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 20
  let yPos = margin

  // Header
  doc.setFontSize(24)
  doc.setTextColor(37, 99, 235) // Primary color
  doc.text('Arham Stationary & Disposal', margin, yPos)
  
  yPos += 10
  doc.setFontSize(10)
  doc.setTextColor(0, 0, 0)
  doc.text('8-1-423/11, Teja Colony Main Rd, Alkapoor Twp Main Rd,', margin, yPos)
  yPos += 5
  doc.text('near 7 Tombs Road, Hyderabad, Telangana 500104', margin, yPos)
  yPos += 5
  doc.text('Phone: 9533732344 | Email: irfanali55@gmail.com', margin, yPos)

  yPos += 15
  doc.setDrawColor(200, 200, 200)
  doc.line(margin, yPos, pageWidth - margin, yPos)

  // Invoice Details
  yPos += 10
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('INVOICE', pageWidth - margin, yPos, { align: 'right' })
  
  yPos += 10
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Invoice No: ${data.invoiceNo}`, pageWidth - margin, yPos, { align: 'right' })
  yPos += 5
  doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, pageWidth - margin, yPos, { align: 'right' })
  yPos += 5
  doc.text(`Order ID: ${data.orderId}`, pageWidth - margin, yPos, { align: 'right' })

  // Customer Details
  yPos += 15
  doc.setFont('helvetica', 'bold')
  doc.text('Bill To:', margin, yPos)
  yPos += 7
  doc.setFont('helvetica', 'normal')
  doc.text(data.customerName, margin, yPos)
  yPos += 5
  doc.text(`Phone: ${data.phone}`, margin, yPos)
  yPos += 5
  const addressLines = doc.splitTextToSize(data.address, pageWidth - 2 * margin - 60)
  doc.text(addressLines, margin, yPos)
  yPos += addressLines.length * 5

  // Items Table
  yPos += 10
  doc.setDrawColor(0, 0, 0)
  doc.setLineWidth(0.5)
  
  // Table Header
  doc.setFont('helvetica', 'bold')
  doc.rect(margin, yPos - 7, pageWidth - 2 * margin, 7)
  doc.text('Item', margin + 2, yPos - 2)
  doc.text('Qty', margin + 100, yPos - 2)
  doc.text('Price', margin + 130, yPos - 2)
  doc.text('Total', pageWidth - margin - 2, yPos - 2, { align: 'right' })

  // Table Rows
  doc.setFont('helvetica', 'normal')
  data.items.forEach((item) => {
    yPos += 7
    if (yPos > doc.internal.pageSize.getHeight() - 40) {
      doc.addPage()
      yPos = margin
    }
    doc.rect(margin, yPos - 7, pageWidth - 2 * margin, 7)
    doc.text(item.name, margin + 2, yPos - 2)
    doc.text(item.quantity.toString(), margin + 100, yPos - 2)
    doc.text(`₹${item.price.toFixed(2)}`, margin + 130, yPos - 2)
    doc.text(`₹${(item.price * item.quantity).toFixed(2)}`, pageWidth - margin - 2, yPos - 2, { align: 'right' })
  })

  // Totals
  yPos += 10
  doc.setFont('helvetica', 'bold')
  doc.text('Subtotal:', pageWidth - margin - 50, yPos, { align: 'right' })
  doc.text(`₹${data.subtotal.toFixed(2)}`, pageWidth - margin - 2, yPos, { align: 'right' })
  yPos += 7
  if (data.gst > 0) {
    doc.text('GST (18%):', pageWidth - margin - 50, yPos, { align: 'right' })
    doc.text(`₹${data.gst.toFixed(2)}`, pageWidth - margin - 2, yPos, { align: 'right' })
    yPos += 7
  }
  doc.setFontSize(12)
  doc.text('Total:', pageWidth - margin - 50, yPos, { align: 'right' })
  doc.text(`₹${data.total.toFixed(2)}`, pageWidth - margin - 2, yPos, { align: 'right' })

  // Payment Mode
  yPos += 10
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Payment Mode: ${data.paymentMode}`, margin, yPos)

  // Footer
  yPos = doc.internal.pageSize.getHeight() - 20
  doc.setFontSize(8)
  doc.setTextColor(128, 128, 128)
  doc.text('Thank you for your business!', pageWidth / 2, yPos, { align: 'center' })

  return doc.output('blob')
}

