import torch
import torch.nn as nn
import timm

def get_model(num_classes=2, pretrained=True):
    """
    EfficientNet-B0 yükler, son katmanı bizim görevimize göre ayarlar.
    """
    model = timm.create_model(
        'efficientnet_b0',
        pretrained=pretrained,
        num_classes=num_classes
    )
    return model


if __name__ == '__main__':
    model = get_model()
    total = sum(p.numel() for p in model.parameters())
    print(f'✅ Model oluşturuldu')
    print(f'   Toplam parametre: {total:,}')