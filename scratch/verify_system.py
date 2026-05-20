import os
import sys
import json
import datetime
import numpy as np
import tensorflow as tf
import tf_keras as keras
import cv2

# Set path contexts
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)
print(f"Project Base Directory: {BASE_DIR}")


# 1. Test database transactions
print("\n--- Phase 1: Database Integrations ---")
try:
    import database
    
    # Initialize DB
    database.init_db()
    print("Database tables initialized successfully!")
    
    # Mock registration
    test_user = f"testuser_{datetime.datetime.now().strftime('%M%S')}"
    test_pass = "SecurePass123"
    test_email = "test@dermshield.ai"
    
    success, msg = database.register_user(test_user, test_pass, test_email)
    print(f"Registration status: {success} ({msg})")
    assert success, "Mock registration failed!"
    
    # Mock login
    login_ok, user_data = database.login_user(test_user, test_pass)
    print(f"Login status: {login_ok} ({'Success' if login_ok else 'Failed'})")
    assert login_ok, "Mock login failed!"
    user_id = user_data["id"]
    print(f"Mock User ID generated: {user_id}")
    
    # Mock checklist
    today_str = datetime.date.today().strftime('%Y-%m-%d')
    database.update_user_checklist(user_id, today_str, 1, 0, 1)
    checklist = database.get_user_checklist(user_id, today_str)
    print(f"Checklist entries retrieved: {dict(checklist)}")
    assert checklist["spf"] == 1 and checklist["cleanse"] == 0 and checklist["hydrate"] == 1, "Checklist mismatch!"
    
    # Mock theme
    database.update_user_theme(user_id, "light")
    theme = database.get_user_theme(user_id)
    print(f"Theme retrieved: {theme}")
    assert theme == "light", "Theme toggle mismatched!"
    
    print("Database Integrations verified: PASS")
except Exception as e:
    import traceback
    print("Database verification FAILED:")
    traceback.print_exc()
    exit(1)

# 2. Test Model prediction and Grad-CAM visualizations
print("\n--- Phase 2: Neural Net & Grad-CAM Visualizations ---")
try:
    import app
    
    MODEL_PATH = os.path.join(BASE_DIR, "skindisease.h5")
    if not os.path.exists(MODEL_PATH):
        print(f"Model file {MODEL_PATH} not found!")
        exit(1)
        
    model = keras.models.load_model(MODEL_PATH)
    print("Model loaded successfully!")
    
    # Create test dummy image in uploads
    upload_dir = os.path.join(BASE_DIR, "uploads")
    os.makedirs(upload_dir, exist_ok=True)
    
    dummy_img_name = "test_verify_spot.jpg"
    dummy_img_path = os.path.join(upload_dir, dummy_img_name)
    
    # Write a dummy pixel matrix to save as image file
    dummy_matrix = np.random.randint(0, 255, (256, 256, 3), dtype=np.uint8)
    cv2.imwrite(dummy_img_path, dummy_matrix)
    print(f"Dummy skin image saved to: {dummy_img_path}")
    
    # Generate heatmap
    heatmap_name = "heatmap_test_verify_spot.jpg"
    heatmap_path = os.path.join(upload_dir, heatmap_name)
    
    pred_idx = app.generate_and_save_gradcam(dummy_img_path, heatmap_path, model)
    labels = ["Acne", "Melanoma", "Peeling skin", "Ring worm", "Vitiligo"]
    print(f"Grad-CAM execution successful. Predicted Class: {labels[pred_idx]}")
    assert os.path.exists(heatmap_path), "Blended heatmap file not found!"
    print(f"Heatmap blended image successfully generated at: {heatmap_path}")
    
    # Add scan to DB
    dummy_conf = {labels[i]: float(1.0 if i == pred_idx else 0.0) for i in range(len(labels))}
    scan_id = database.add_scan(
        user_id,
        dummy_img_name,
        heatmap_name,
        labels[pred_idx],
        dummy_conf,
        "Low",
        "Clinical Dermatologist Specialist"
    )
    print(f"Diagnostic Scan entry registered in database. ID: {scan_id}")
    assert scan_id is not None, "Failed to save scan record!"
    
    print("Grad-CAM and Neural Net pipelines verified: PASS")
except Exception as e:
    import traceback
    print("Grad-CAM verification FAILED:")
    traceback.print_exc()
    exit(1)

# 3. Test Medical PDF Report Generation
print("\n--- Phase 3: Medical PDF Report Compilation ---")
try:
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Image as RLImage, Table, TableStyle
    from reportlab.lib.pagesizes import letter
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib import colors
    
    pdf_filename = f"Report_Scan_Verify.pdf"
    pdf_path = os.path.join(upload_dir, pdf_filename)
    
    doc = SimpleDocTemplate(pdf_path, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
    story = []
    
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'TitleStyle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        textColor=colors.HexColor('#4f46e5'),
        spaceAfter=15,
        alignment=1
    )
    body_style = ParagraphStyle(
        'BodyStyle', parent=styles['BodyText'], fontName='Helvetica', fontSize=10, leading=14
    )
    
    story.append(Paragraph("DERMASHIELD AI - DIAGNOSTIC REPORT CHECK", title_style))
    story.append(Paragraph(f"Verification Assessment Date: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", body_style))
    
    # Side by side scans check
    img_cells = [
        RLImage(dummy_img_path, width=150, height=150),
        RLImage(heatmap_path, width=150, height=150)
    ]
    img_table = Table([[img_cells[0], img_cells[1]]], colWidths=[270, 270])
    img_table.setStyle(TableStyle([
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(img_table)
    
    doc.build(story)
    print(f"Medical Report PDF compiled and saved successfully: {pdf_path}")
    assert os.path.exists(pdf_path), "Medical PDF Report missing!"
    
    # Cleanup dummy files
    os.remove(dummy_img_path)
    os.remove(heatmap_path)
    os.remove(pdf_path)
    print("Temporary verification assets successfully cleared.")
    
    print("PDF Compiler verified: PASS")
except Exception as e:
    import traceback
    print("PDF Compilation verification FAILED:")
    traceback.print_exc()
    exit(1)

print("\n=======================================================")
print("ALL SYSTEM INTEGRATION CHECKS COMPLETED SUCCESSFULLY: PASS")
print("=======================================================")
