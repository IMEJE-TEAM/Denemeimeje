"""
predict.py — Model Tahmin Modülü
=================================
Bu dosya:
  - Osman'ın FastAPI'si tarafından import edilir
  - Tek bir fotoğraf alır, 'fire' veya 'no_fire' döner

Kullanım:
    from predict import load_model, predict_image
    model = load_model('./model_weights.pth')
    result = predict_image(model, 'orman.jpg')
    print(result)  # {'label': 'fire', 'confidence': 0.95}
"""

import torch
import torch.nn as nn
from torchvision import transforms
from PIL import Image
import timm
import io

# ── Sabitler ──────────────────────────────────────────────
IMG_SIZE    = 224
CLASS_NAMES = ['fire', 'no_fire']   # ImageFolder alfabetik sırası
DEVICE      = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

# ── Transform (eğitimle aynı eval transform) ──────────────
_transform = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])


def load_model(weights_path: str = './model_weights.pth') -> nn.Module:
    """
    EfficientNet-B0 modelini yükler ve eval moduna alır.
    Sunucu başlarken bir kez çağrılır.
    """
    model = timm.create_model('efficientnet_b0', pretrained=False, num_classes=2)
    model.load_state_dict(torch.load(weights_path, map_location=DEVICE))
    model.to(DEVICE)
    model.eval()
    print(f'✅ Model yüklendi ({DEVICE}): {weights_path}')
    return model


def predict_image(model: nn.Module, image_input) -> dict:
    """
    Parametre
    ---------
    model       : load_model() ile yüklenmiş model
    image_input : dosya yolu (str) | PIL.Image | bytes

    Döndürür
    --------
    {
        'label'      : 'fire' veya 'no_fire',
        'confidence' : float  (0.0 – 1.0),
        'fire_prob'  : float,
        'nofire_prob': float
    }
    """
    # Görüntüyü PIL'e çevir
    if isinstance(image_input, str):
        img = Image.open(image_input).convert('RGB')
    elif isinstance(image_input, bytes):
        img = Image.open(io.BytesIO(image_input)).convert('RGB')
    elif isinstance(image_input, Image.Image):
        img = image_input.convert('RGB')
    else:
        raise ValueError(f'Desteklenmeyen format: {type(image_input)}')

    # Tensor'a çevir ve modelden geçir
    tensor = _transform(img).unsqueeze(0).to(DEVICE)

    with torch.no_grad():
        out   = model(tensor)
        probs = torch.softmax(out, dim=1)[0]

    fire_prob   = probs[CLASS_NAMES.index('fire')].item()
    nofire_prob = probs[CLASS_NAMES.index('no_fire')].item()
    label       = 'fire' if fire_prob > nofire_prob else 'no_fire'
    confidence  = max(fire_prob, nofire_prob)

    return {
        'label'      : label,
        'confidence' : round(confidence, 4),
        'fire_prob'  : round(fire_prob, 4),
        'nofire_prob': round(nofire_prob, 4)
    }


# ── Test: direkt çalıştırılırsa ───────────────────────────
if __name__ == '__main__':
    import sys
    if len(sys.argv) < 2:
        print('Kullanım: python predict.py <fotoğraf_yolu>')
        sys.exit(1)

    img_path = sys.argv[1]
    mdl      = load_model('./model_weights.pth')
    result   = predict_image(mdl, img_path)

    print('\n── Sonuç ──────────────────────────')
    print(f"Tahmin    : {result['label'].upper()}")
    print(f"Güven     : %{result['confidence']*100:.1f}")
    print(f"Yangın    : %{result['fire_prob']*100:.1f}")
    print(f"Normal    : %{result['nofire_prob']*100:.1f}")
