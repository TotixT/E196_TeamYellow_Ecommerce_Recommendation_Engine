You are a senior UI/UX designer. I have an existing high-fidelity 
mockup of an e-commerce platform called "Ecommerce Intelligent Engine" 
(EIE). The design is already well-developed. I need you to ADD the 
missing error states and edge case screens to complete the high-fidelity 
mockup. Do NOT redesign existing screens — only ADD new states/variants.

=== DESIGN SYSTEM (already established — maintain it) ===
- Primary color: #2E75B6 (blue)
- Error color: #DC2626 (red)
- Success color: #16A34A (green)  
- Warning color: #D97706 (amber)
- Background: #FFFFFF / #F9FAFB
- Font: Inter or similar sans-serif
- Border radius: 8px on cards, 6px on inputs
- All text in Spanish (es-CO)

=== SCREENS TO ADD (error states & edge cases) ===

--- AUTH SCREENS ---

1. LOGIN — Error state: wrong credentials
   Same layout as existing login. Add:
   - Red alert banner between password field and button:
     icon ⚠️ + "Las credenciales ingresadas son incorrectas. 
     Verifica tu correo y contraseña."
   - Both fields get red border (#DC2626)
   - Button remains active (not disabled)

2. LOGIN — Error state: empty fields
   Same layout. Add:
   - Each empty field gets red border + small red text below:
     Email empty: "El correo electrónico es obligatorio"
     Password empty: "La contraseña es obligatoria"

3. REGISTER — Error state: full validation
   Same layout. Show ALL field errors simultaneously:
   - Nombre vacío → red border + "El nombre es obligatorio"
   - Email inválido → red border + "Ingresa un correo válido 
     (ej: usuario@correo.com)"
   - Email ya registrado → red border + "Este correo ya está 
     registrado. ¿Deseas iniciar sesión?"  
     (make "iniciar sesión" a blue link)
   - Contraseña muy corta → red border + password strength bar 
     (red = weak) + "Mínimo 8 caracteres, 1 mayúscula y 
     1 carácter especial"
   - Contraseñas no coinciden → red border on confirm field + 
     "Las contraseñas no coinciden"

4. REGISTER — Password strength indicator
   Add below password field (standalone variant):
   - Strength bar: 4 segments
     · 1 red segment = "Muy débil"
     · 2 orange segments = "Débil"  
     · 3 yellow segments = "Aceptable"
     · 4 green segments = "Segura ✓"

--- CATALOG / PRODUCT SCREENS ---

5. CATALOG — Empty search results state
   Same catalog layout but grid area shows:
   - Large centered illustration (magnifying glass with X)
   - "No encontramos resultados para '[término buscado]'"
   - Subtitle: "Intenta con otro término o explora nuestras 
     categorías"
   - Button: "Ver todos los productos →"

6. PRODUCT DETAIL — Out of stock state
   Same detail layout but:
   - Replace green "Disponible (X en stock)" badge with 
     red badge "Agotado"
   - Quantity selector: grayed out, disabled
   - "Agregar al carrito" button: gray background (#9CA3AF), 
     disabled, text changes to "Sin stock disponible"
   - Add text below button: 
     "Te avisaremos cuando vuelva a estar disponible"
     with a small "Notificarme 🔔" link in blue

7. CATALOG — Product card: out of stock variant
   Same card layout but:
   - Red "Agotado" badge overlay on top-left of image
   - "Agregar al carrito" button grayed out and disabled
   - Image with 20% opacity overlay to signal unavailability

--- CART SCREENS ---

8. CART — Empty state
   Same cart layout but table area shows:
   - Shopping cart icon (large, outlined, gray)
   - "Tu carrito está vacío"
   - Subtitle: "Agrega productos desde el catálogo 
     para comenzar tu compra"
   - Button: "Explorar catálogo →" (primary blue)

9. CART — Stock conflict warning
   Same cart layout but on the product row:
   - Amber warning banner above the table:
     ⚠️ "Algunos productos ya no tienen el stock solicitado. 
     Revisa las cantidades antes de continuar."
   - Affected product row: amber left border + 
     small text below product name in amber:
     "Solo quedan 2 unidades disponibles"
   - Quantity input shows red border if qty > available stock

--- CHECKOUT SCREENS ---

10. CHECKOUT Step 2 — Shipping form errors
    Same step 2 layout. Show validation errors:
    - Nombre vacío → red border + "El nombre es obligatorio"
    - Dirección vacía → red border + 
      "La dirección de entrega es obligatoria"
    - Ciudad vacía → red border + "La ciudad es obligatoria"
    - Teléfono inválido → red border + 
      "Ingresa un número válido de 10 dígitos"
    - "Continuar" button stays active but triggers validation

11. CHECKOUT Step 3 — Payment form errors
    Same step 3 layout. Show:
    - Número de tarjeta inválido (< 16 digits) → red border + 
      "El número de tarjeta debe tener 16 dígitos"
    - Fecha vencida → red border + 
      "La tarjeta está vencida"
    - CVV incompleto → red border + 
      "El CVV debe tener 3 dígitos"
    - Nombre vacío → red border + 
      "El nombre en la tarjeta es obligatorio"
    - General payment error banner (card declined):
      Red banner at top: ⚠️ "Tu tarjeta fue rechazada. 
      Verifica los datos o intenta con otra tarjeta."

--- ADMIN SCREENS ---

12. ADMIN — New product form: validation errors
    Form to add/edit a product. Show validation errors:
    - Nombre vacío → "El nombre del producto es obligatorio"
    - Precio inválido (0 or negative) → 
      "El precio debe ser mayor a $0"
    - Stock negativo → "El stock no puede ser negativo"
    - Sin imagen → amber warning: 
      "Agrega al menos una imagen del producto"
    - Categoría no seleccionada → 
      "Selecciona una categoría"

13. ADMIN — Deactivate product confirmation modal
    Overlay modal on top of product list:
    - Title: "¿Desactivar producto?"
    - Body: "El producto 'Audífonos Inalámbricos Pro' dejará 
      de mostrarse en el catálogo. 
      Podrás reactivarlo en cualquier momento."
    - Buttons: "Cancelar" (outline) | "Desactivar" (red)

14. ADMIN — Deactivate user confirmation modal
    Same modal pattern:
    - Title: "¿Desactivar usuario?"
    - Body: "El usuario carlos@email.com no podrá 
      iniciar sesión hasta que lo reactives."
    - Buttons: "Cancelar" (outline) | "Desactivar" (red)

=== ORGANIZATION ===
- Group all new screens in a Figma section called 
  "Estados de Error y Casos Borde"
- Each screen should be labeled clearly:
  e.g. "LOGIN / Error - Credenciales incorrectas"
- Maintain exact same frame size as existing screens (1440px wide)
- Use Auto Layout where possible for consistency