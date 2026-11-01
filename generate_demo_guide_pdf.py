import os
import sys
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#64748b"))
        
        # Header (Pages after page 1)
        if self._pageNumber > 1:
            self.drawString(40, 812, "MSHOPPY (MEESHO CLONE) — SIR DEMO & PRESENTATION GUIDE")
            self.setFont("Helvetica", 8)
            self.drawRightString(555, 812, "Live Demo Script (Hinglish)")
            self.setStrokeColor(colors.HexColor("#e2e8f0"))
            self.setLineWidth(0.75)
            self.line(40, 804, 555, 804)
        
        # Footer
        self.setStrokeColor(colors.HexColor("#e2e8f0"))
        self.setLineWidth(0.75)
        self.line(40, 38, 555, 38)
        self.setFont("Helvetica", 8)
        self.drawString(40, 26, "MShoppy Project Presentation Guide | Prepared for Sir Demo")
        self.setFont("Helvetica-Bold", 8)
        self.drawRightString(555, 26, f"Page {self._pageNumber} of {page_count}")
        self.restoreState()

def build_demo_pdf(filename="SIR_DEMO_EXPLANATION_GUIDE.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=A4,
        leftMargin=38,
        rightMargin=38,
        topMargin=44,
        bottomMargin=48
    )

    styles = getSampleStyleSheet()

    # Premium Brand Palette
    PRIMARY = colors.HexColor("#b90041")      # Meesho Pink / Magenta
    PRIMARY_DARK = colors.HexColor("#831843") # Deep Berry
    SECONDARY = colors.HexColor("#0f172a")    # Midnight Slate
    ACCENT_GREEN = colors.HexColor("#047857") # Emerald Green
    ACCENT_BLUE = colors.HexColor("#1d4ed8")  # Royal Indigo
    BG_LIGHT = colors.HexColor("#f8fafc")     # Pure Slate Tint
    BORDER_LIGHT = colors.HexColor("#cbd5e1") # Border Grey
    DIALOGUE_BG = colors.HexColor("#fef2f2")  # Light Rose for dialogue box
    ACTION_BG = colors.HexColor("#eff6ff")    # Light Blue for screen action

    # Typography Styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=PRIMARY,
        spaceAfter=3
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=14,
        textColor=colors.HexColor("#475569"),
        spaceAfter=10
    )

    h1_style = ParagraphStyle(
        'Heading1Custom',
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=17,
        textColor=SECONDARY,
        spaceBefore=12,
        spaceAfter=6,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Heading2Custom',
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=14,
        textColor=PRIMARY_DARK,
        spaceBefore=8,
        spaceAfter=3,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'BodyCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12.5,
        textColor=colors.HexColor("#1e293b")
    )

    dialogue_style = ParagraphStyle(
        'DialogueStyle',
        parent=body_style,
        fontName='Helvetica-Oblique',
        fontSize=8.5,
        leading=12.5,
        textColor=colors.HexColor("#881337") # Deep Rose
    )

    action_style = ParagraphStyle(
        'ActionStyle',
        parent=body_style,
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor("#1e40af") # Deep Blue
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        fontName='Helvetica-Bold',
        fontSize=8.2,
        leading=11,
        textColor=colors.white,
        alignment=1
    )

    table_cell_style = ParagraphStyle(
        'TableCell',
        fontName='Helvetica',
        fontSize=7.8,
        leading=10.8,
        textColor=colors.HexColor("#1e293b")
    )

    table_cell_bold = ParagraphStyle(
        'TableCellBold',
        fontName='Helvetica-Bold',
        fontSize=7.8,
        leading=10.8,
        textColor=SECONDARY
    )

    story = []

    # ─────────────────────────────────────────────────────────────
    # COVER / HEADER BANNER
    # ─────────────────────────────────────────────────────────────
    story.append(Paragraph("MEESHO CLONE — SIR DEMO & PRESENTATION GUIDE", title_style))
    story.append(Paragraph(
        "<b>Project:</b> MShoppy E-Commerce & Affiliate Ecosystem &bull; <b>Language:</b> Professional Hinglish<br/>"
        "<b>Purpose:</b> Step-by-Step Live Demo Script, Dialogue Prompts, Screen Navigation, and Technical Q&A", 
        subtitle_style
    ))
    story.append(HRFlowable(width="100%", thickness=2.5, color=PRIMARY, spaceBefore=0, spaceAfter=10))

    # ─────────────────────────────────────────────────────────────
    # 1. THE 30-SECOND ELEVATOR PITCH
    # ─────────────────────────────────────────────────────────────
    story.append(Paragraph("1. Opening Pitch (Sir ke Saamne Shuruat ke 30 Seconds)", h1_style))
    
    pitch_text = (
        "<b>Kya Bolna Hai (Exact Dialogue):</b><br/>"
        "<i>\"Good morning/afternoon Sir! Aaj main aapko hamare <b>Meesho Clone (MShoppy)</b> platform ka live architecture aur working demo present karne ja raha hoon.<br/><br/>"
        "Hamare project me <b>3 primary pillars</b> hain:<br/>"
        "1. <b>Customer Shopping Panel:</b> Jahan real products browse karke cart, address selection aur Cash on Delivery / Online payment ke sath real order database me book hota hai.<br/>"
        "2. <b>Affiliate Partner Suite:</b> Jahan verified creators standard MRP par 15% automatic commission kamate hain apne unique referral link se.<br/>"
        "3. <b>Reseller & Admin Hub:</b> Jahan wholesale margin tracking, upcoming Wednesday payouts, aur compliance KYC verification real-time manage hoti hai.<br/><br/>"
        "Sir, ye poora project <b>PostgreSQL Database (Prisma ORM)</b> aur <b>Express REST APIs</b> se 100% dynamic hai — isme koi hardcoded dummy data nahi hai.\"</i>"
    )
    pitch_table = Table([[Paragraph(pitch_text, dialogue_style)]], colWidths=[520])
    pitch_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), DIALOGUE_BG),
        ('BOX', (0, 0), (-1, -1), 1, PRIMARY),
        ('PADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(pitch_table)
    story.append(Spacer(1, 10))

    # ─────────────────────────────────────────────────────────────
    # 2. STEP-BY-STEP LIVE DEMO WALKTHROUGH
    # ─────────────────────────────────────────────────────────────
    story.append(Paragraph("2. Step-by-Step Live Demo Flow (Screen par kya karein aur kya bolein)", h1_style))

    steps_data = [
        [
            Paragraph("Step & Route", table_header_style),
            Paragraph("Screen Par Kya Dikhana Hai (Action)", table_header_style),
            Paragraph("Muh Se Kya Bolna Hai (Dialogue in Hinglish)", table_header_style)
        ],
        [
            Paragraph("<b>STEP 1</b><br/>Customer Shopping & Real Order<br/><code>/user-home</code><br/><code>/checkout-payment</code>", table_cell_bold),
            Paragraph("• Homepage par saree/kurti product open karein.<br/>• Size select karke 'Buy Now' karein.<br/>• Address select karke Cash on Delivery (COD) confirm karein.", action_style),
            Paragraph("<i>\"Sir, sabse pehle Customer Flow dekhte hain. Saare products aur categories live PostgreSQL database se load ho rahe hain. Customer address fill karke COD order book karta hai. Order confirm hote hi unique Order ID (jaise #b6dd9eb7) generate hoti hai jo database me save ho jati hai aur customer ko clean invoice dikhta hai.\"</i>", dialogue_style)
        ],
        [
            Paragraph("<b>STEP 2</b><br/>Affiliate Google Login & KYC Guard<br/><code>/login?role=affiliate</code><br/><code>/affiliate-kyc</code>", table_cell_bold),
            Paragraph("• Affiliate role select karke Google Sign-in karein.<br/>• System check karega aur direct panel ke bajay <code>/affiliate-kyc</code> par redirect karega.", action_style),
            Paragraph("<i>\"Sir, ab hamara Affiliate Onboarding dekhiye. Compliance safety ke liye humne strict KYC Route Guard lagaya hai. Naya user jab Google se login karta hai, system check karta hai ki kya KYC submitted hai. Agar nahi hai, toh ye automatically Google Name aur Email pre-fill karke partner ko KYC form par le jata hai.\"</i>", dialogue_style)
        ],
        [
            Paragraph("<b>STEP 3</b><br/>Admin KYC Approval Hub<br/><code>/admin-affiliate-kyc</code>", table_cell_bold),
            Paragraph("• Admin panel me jayein.<br/>• User ki live application table me top par dikhegi.<br/>• 'Approve' button dabayein.", action_style),
            Paragraph("<i>\"Sir, jab tak compliance team approve nahi karti, partner ka panel blocked rehta hai. Admin panel me live application top par aati hai. Admin jaise hi 'Approve' click karta hai, user ka status instantly background me APPROVED ho jata hai aur unhe live notification aati hai.\"</i>", dialogue_style)
        ],
        [
            Paragraph("<b>STEP 4</b><br/>Affiliate Suite & Referral Code<br/><code>/affiliate-panel</code>", table_cell_bold),
            Paragraph("• Approved affiliate ka panel open karein.<br/>• Unique code (e.g. <code>AFF-SHRUT554</code>) aur 1-Click Copy button dikhaiye.", action_style),
            Paragraph("<i>\"Approval ke baad partner ka Affiliate Suite unlock hota hai. Yahan aap partner ka unique code dekh sakte hain (jaise AFF-SHRUT554). Ye dummy nahi hai — system user ke Google email prefix aur unique digits se dynamically generate karta hai. Yahan se partner product link copy karke share karta hai.\"</i>", dialogue_style)
        ],
        [
            Paragraph("<b>STEP 5</b><br/>15% Automatic Commission Engine<br/><code>/product/:id?ref=...</code>", table_cell_bold),
            Paragraph("• Referral link se checkout ka demo dein.<br/>• Affiliate ke wallet me 15% commission reflect hota hua dikhaiye.", action_style),
            Paragraph("<i>\"Jab koi customer is partner link se aakar ₹849 ka order place karta hai, system automatically backend me 15% commission (₹127) calculate karta hai aur Affiliate Wallet me credit kar deta hai. Customer ke receipt par privacy bani rehti hai. Aur agar direct shopping hogi, toh ₹0 commission rahega.\"</i>", dialogue_style)
        ],
        [
            Paragraph("<b>STEP 6</b><br/>Reseller Wallet & Real Payouts<br/><code>/reseller-wallet</code><br/><code>/withdraw-earnings</code>", table_cell_bold),
            Paragraph("• Reseller Wallet open karein.<br/>• Upcoming Wednesday payout, delivered orders count, aur CSV download dikhaiye.", action_style),
            Paragraph("<i>\"Sir, Wallet me saare metrics dynamic hain. Next Payout Date aane wale Wednesday ke hisab se calculate hoti hai. Delivered orders count real orders se aata hai, aur 'Download Monthly Report' button se current month ka live CSV download hota hai.\"</i>", dialogue_style)
        ]
    ]

    steps_table = Table(steps_data, colWidths=[105, 175, 240])
    steps_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), SECONDARY),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_LIGHT),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, BG_LIGHT])
    ]))
    story.append(steps_table)
    story.append(Spacer(1, 10))

    # Page Break for Q&A and Technical Specs
    story.append(PageBreak())

    # ─────────────────────────────────────────────────────────────
    # 3. TRICKY QUESTIONS SIR MIGHT ASK & WINNING ANSWERS
    # ─────────────────────────────────────────────────────────────
    story.append(Paragraph("3. Expected Tricky Questions from Sir & Confident Answers", h1_style))
    story.append(Paragraph("Sir demo ke dauran jo technical sawal pooch sakte hain, unka seedha aur solid jawab yahan hai:", body_style))
    story.append(Spacer(1, 4))

    qa_data = [
        [
            Paragraph("Question Sir Might Ask", table_header_style),
            Paragraph("What You Should Answer (Hinglish Answer)", table_header_style)
        ],
        [
            Paragraph("<b>Q1: Kya database real hai ya frontend me mock data chal raha hai?</b>", table_cell_bold),
            Paragraph("<i>\"Sir, hamara database 100% Real hai. Humne Supabase par hosted <b>PostgreSQL Database</b> aur <b>Prisma ORM</b> use kiya hai. Jo order abhi humne place kiya (#b6dd9eb7), wo direct PostgreSQL ke <code>Order</code> table me save hua hai. Hum Prisma Studio me live rows verify kar sakte hain.\"</i>", dialogue_style)
        ],
        [
            Paragraph("<b>Q2: Affiliate aur Reseller me kya farak hai tumhare system me?</b>", table_cell_bold),
            Paragraph("<i>\"Sir, <b>Affiliate Program</b> me customer platform ki standard MRP (jaise ₹849) par hi samaan khareedta hai, aur Meesho apne profit margin me se partner ko direct <b>15% fix commission</b> unke wallet me deta hai (jaise Amazon/Flipkart me hota hai).<br/>Jabki <b>Reseller Program</b> me reseller wholesale price par apna custom margin add karke customer ke liye order khud book karta hai.\"</i>", dialogue_style)
        ],
        [
            Paragraph("<b>Q3: Agar koi bina referral link ke shopping kare, toh kya kisi ko commission milega?</b>", table_cell_bold),
            Paragraph("<i>\"Sir, bilkul nahi! Agar customer direct website par aata hai, toh URL me koi referral code nahi hota aur commission <b>₹0</b> rehta hai — sara revenue platform/seller ke paas rehta hai. Commission sirf tabhi calculate hota hai jab partner ka verified link use ho.\"</i>", dialogue_style)
        ],
        [
            Paragraph("<b>Q4: Customer ko receipt me kyu nahi dikhta ki affiliate ko ₹127 gaya?</b>", table_cell_bold),
            Paragraph("<i>\"Sir, ye E-Commerce industry ka strict <b>Privacy Standard</b> hai. Customer ko lagna chahiye ki usne direct official price par khareeda hai. Agar customer ko invoice par dikhega ki ₹127 kisi promoter ko gaya, toh customer confuse hoga. Isliye affiliate commission sirf Affiliate Dashboard aur Notification Center me privately jata hai.\"</i>", dialogue_style)
        ],
        [
            Paragraph("<b>Q5: Referral code 'AFF-SHRUT554' kaise bana?</b>", table_cell_bold),
            Paragraph("<i>\"Sir, ye code backend authentication engine ne Google OAuth ke email prefix (SHRUT) + category tag (AFF) + unique 3-digit security code (554) ko combine karke dynamically calculate kiya hai. Har partner ka code automatically unique generate hota hai.\"</i>", dialogue_style)
        ]
    ]

    qa_table = Table(qa_data, colWidths=[170, 350])
    qa_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY_DARK),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_LIGHT),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, BG_LIGHT])
    ]))
    story.append(qa_table)
    story.append(Spacer(1, 10))

    # ─────────────────────────────────────────────────────────────
    # 4. TECH STACK & SYSTEM ARCHITECTURE SUMMARY
    # ─────────────────────────────────────────────────────────────
    story.append(Paragraph("4. Technical Stack Summary for Sir", h1_style))

    tech_data = [
        [Paragraph("Layer", table_header_style), Paragraph("Technologies Used", table_header_style), Paragraph("Key Responsibilities & Implementation", table_header_style)],
        [
            Paragraph("<b>Frontend</b>", table_cell_bold),
            Paragraph("React.js, Vite, TailwindCSS, Material Symbols", table_cell_style),
            Paragraph("Responsive desktop & mobile UI, dynamic routing (<code>/product/:id</code>), reactive session store, realtime notifications.", table_cell_style)
        ],
        [
            Paragraph("<b>Backend API</b>", table_cell_bold),
            Paragraph("Node.js, Express.js REST APIs", table_cell_style),
            Paragraph("Authentication controllers, order placement pipeline, 15% affiliate calculation engine, address management.", table_cell_style)
        ],
        [
            Paragraph("<b>Database</b>", table_cell_bold),
            Paragraph("PostgreSQL, Supabase, Prisma ORM", table_cell_style),
            Paragraph("Relational schema: <code>User</code>, <code>Order</code>, <code>OrderItem</code>, <code>Product</code>, <code>Category</code>, <code>Review</code>, <code>KYCApplication</code>.", table_cell_style)
        ],
        [
            Paragraph("<b>Auth & Security</b>", table_cell_bold),
            Paragraph("Firebase Google OAuth, JWT tokens", table_cell_style),
            Paragraph("Role-based access control, KYC status route guards, sanitized checkout receipts.", table_cell_style)
        ]
    ]

    tech_table = Table(tech_data, colWidths=[80, 150, 290])
    tech_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), SECONDARY),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_LIGHT),
        ('TOPPADDING', (0, 0), (-1, -1), 4.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4.5),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, BG_LIGHT])
    ]))
    story.append(tech_table)
    story.append(Spacer(1, 10))

    # ─────────────────────────────────────────────────────────────
    # 5. DEMO CLOSING STATEMENT
    # ─────────────────────────────────────────────────────────────
    closing_p = Paragraph(
        "<b>Sir ke Saamne Presentation End Karne ka Dialogue:</b><br/>"
        "<i>\"Thank you Sir! Is tarah hamara platform Customer shopping se lekar Affiliate promotion, live commission calculation, aur Admin KYC approval tak poori tarah seamlessly integrated hai.<br/>"
        "Aapka koi question ya specific code inspection ho toh main abhi live demonstrate kar sakta hoon.\"</i>",
        dialogue_style
    )
    closing_table = Table([[closing_p]], colWidths=[520])
    closing_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
        ('BOX', (0, 0), (-1, -1), 1, PRIMARY),
        ('PADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(closing_table)

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"[SUCCESS] Demo Guide PDF generated at: {os.path.abspath(filename)}")

if __name__ == '__main__':
    target = sys.argv[1] if len(sys.argv) > 1 else "SIR_DEMO_EXPLANATION_GUIDE.pdf"
    build_demo_pdf(target)
