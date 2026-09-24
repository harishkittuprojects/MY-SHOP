from PIL import Image

def get_bg_color(image_path):
    with Image.open(image_path) as img:
        img = img.convert('RGB')
        # Get color of top-left pixel
        color = img.getpixel((10, 10))
        return '#{:02x}{:02x}{:02x}'.format(*color)

print(get_bg_color('public/logo-new.png'))
