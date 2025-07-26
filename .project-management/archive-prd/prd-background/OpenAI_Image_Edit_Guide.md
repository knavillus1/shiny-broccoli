# OpenAI Image Edit API Guide

This guide demonstrates how to use the OpenAI API to edit images programmatically using interactive mask creation and the DALL-E 2 image editing capabilities.

## Overview

The workflow consists of three main steps:
1. **Interactive Mask Creation**: Create a mask by drawing rectangles on the original image
2. **Mask Processing**: Convert the mask to the proper RGBA format required by OpenAI
3. **Image Editing**: Use the OpenAI API to edit the image based on the mask and prompt

## Prerequisites

- Python environment with required packages (see `requirements.txt`)
- OpenAI API key stored in a `.env` file
- An image file to edit (PNG format recommended)

## Step 1: Setup and Image Loading

```python
import os
from dotenv import load_dotenv
from PIL import Image

# Load environment variables
load_dotenv()
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

# Load your image
img_path = 'image1.png'
img = Image.open(img_path)
img_size = img.size  # (width, height)
```

## Step 2: Interactive Mask Creation

The interactive masking system allows you to define edit regions by drawing rectangles on the image.

### Key Components

1. **Matplotlib Widget Backend**: Enables interactive plotting
2. **Rectangle Drawing**: Click-based rectangle selection
3. **Real-time Visualization**: Shows both original image and mask

### Core Implementation

```python
%matplotlib widget
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle

# Load image as RGBA
img = Image.open(img_path).convert('RGBA')
arr = np.array(img)
alpha = arr[:, :, 3]

# Generate initial mask from transparent pixels
initial_mask = (alpha == 0).astype(np.uint8) * 255

# Initialize mask and drawing state
mask = np.zeros_like(alpha)
rectangles = []
drawing = False
start_point = None

def onclick(event):
    global drawing, start_point
    
    if event.inaxes != ax_img or event.button != 1:
        return
        
    if event.xdata is None or event.ydata is None:
        return
        
    if not drawing:
        # Start drawing rectangle
        drawing = True
        start_point = (int(event.xdata), int(event.ydata))
    else:
        # Finish drawing rectangle
        end_point = (int(event.xdata), int(event.ydata))
        drawing = False
        
        # Calculate rectangle bounds
        x1, y1 = start_point
        x2, y2 = end_point
        x_min, x_max = min(x1, x2), max(x1, x2)
        y_min, y_max = min(y1, y2), max(y1, y2)
        
        # Ensure minimum rectangle size
        if x_max - x_min < 5 or y_max - y_min < 5:
            x_max = x_min + 20
            y_max = y_min + 20
        
        # Add to mask
        mask[y_min:y_max, x_min:x_max] = 255
        rectangles.append((x_min, y_min, x_max, y_max))
        
        update_display()

def update_display():
    # Clear and redraw both subplots
    ax_img.clear()
    ax_mask.clear()
    
    # Show original image with rectangles
    ax_img.imshow(img)
    ax_img.set_title('Original Image\n(Click twice to draw rectangles)')
    ax_img.axis('off')
    
    # Draw rectangles on original image
    for i, (x_min, y_min, x_max, y_max) in enumerate(rectangles):
        rect = Rectangle((x_min, y_min), x_max-x_min, y_max-y_min,
                        linewidth=3, edgecolor='red', facecolor='red', alpha=0.3)
        ax_img.add_patch(rect)
        
        # Add rectangle number
        ax_img.text(x_min + 5, y_min + 15, f'{i+1}', 
                   color='white', fontsize=12, fontweight='bold',
                   bbox=dict(boxstyle="round,pad=0.3", facecolor='red', alpha=0.8))
    
    # Show current mask
    combined = np.maximum(initial_mask, mask)
    ax_mask.imshow(combined, cmap='gray')
    ax_mask.set_title(f'Mask ({len(rectangles)} rectangles)')
    ax_mask.axis('off')
    
    plt.tight_layout()
    fig.canvas.draw_idle()

# Create figure and setup interaction
fig, (ax_img, ax_mask) = plt.subplots(1, 2, figsize=(14, 7))
fig.canvas.toolbar_visible = False
update_display()
cid = fig.canvas.mpl_connect('button_press_event', onclick)
plt.show()
```

### Usage Instructions

1. **Start Drawing**: Click once on the left image to start drawing a rectangle
2. **Finish Rectangle**: Click once again to finish the rectangle
3. **Repeat**: Add multiple rectangles as needed
4. **Visual Feedback**: Each rectangle is numbered and highlighted in red
5. **Live Preview**: The right panel shows the current mask state

## Step 3: Mask Processing and RGBA Conversion

The mask must be converted to RGBA format where:
- **Transparent regions** (alpha=0): Areas to be edited
- **Opaque regions** (alpha=255): Areas to be preserved

```python
# Combine user-drawn mask with initial transparency mask
final_mask = np.maximum(initial_mask, mask)

# Convert to PIL Image
mask_gray = Image.fromarray(final_mask.astype("uint8"), mode="L")

# Create alpha channel (invert mask: 255->0, 0->255)
alpha = mask_gray.point(lambda p: 255 - p)

# Build RGBA image with proper alpha channel
mask_rgba = Image.new("RGBA", mask_gray.size, color=(0, 0, 0, 0))
mask_rgba.putalpha(alpha)

# Save as PNG file
mask_rgba.save("generated_mask.png")
```

### Mask Format Requirements

- **File Format**: PNG with RGBA channels
- **Alpha Channel Logic**: 
  - 0 (transparent) = edit this area
  - 255 (opaque) = keep this area unchanged
- **RGB Channels**: Can be any value (only alpha matters)

## Step 4: OpenAI Image Edit API Call

```python
from openai import OpenAI
import requests

# Initialize OpenAI client
client = OpenAI(api_key=OPENAI_API_KEY)

# Define paths and prompt
mask_path = "generated_mask.png"
prompt = input("Enter your prompt for the image edit: ")

# Generate output filename
base, ext = os.path.splitext(img_path)
edited_path = f"{base}_edited{ext}"

# Make API call
with open(img_path, "rb") as image_file, open(mask_path, "rb") as mask_file:
    result = client.images.edit(
        model="dall-e-2",
        image=image_file,
        mask=mask_file,
        prompt=prompt,
        n=1,
        size=f"{img_size[0]}x{img_size[1]}",
    )

# Download and save result
image_url = result.data[0].url
resp = requests.get(image_url)
resp.raise_for_status()

with open(edited_path, "wb") as f:
    f.write(resp.content)

print(f"Edited image saved to: {edited_path}")
```

### API Parameters

- **model**: "dall-e-2" (currently the only supported model)
- **image**: Original image file (PNG/JPEG, max 4MB)
- **mask**: RGBA mask file (PNG, same dimensions as image)
- **prompt**: Text description of desired changes
- **n**: Number of variations to generate (1-10)
- **size**: Output size (must match input dimensions)

## Key Features

### Interactive Mask Creation
- **Visual Interface**: Click-based rectangle drawing
- **Real-time Preview**: Immediate feedback on mask changes
- **Multiple Regions**: Support for multiple edit areas
- **Numbered Regions**: Visual identification of each rectangle

### Robust Mask Processing
- **Transparency Handling**: Automatic detection of transparent pixels
- **Format Conversion**: Proper RGBA conversion for OpenAI API
- **Size Validation**: Minimum rectangle size enforcement

### API Integration
- **Error Handling**: Proper exception handling for API calls
- **File Management**: Automatic filename generation
- **Response Processing**: Download and save edited images

## Best Practices

1. **Image Preparation**:
   - Use high-quality source images
   - Ensure images are under 4MB
   - PNG format recommended for transparency support

2. **Mask Creation**:
   - Create precise masks for better results
   - Avoid overlapping edit regions
   - Test with simple edits first

3. **Prompt Engineering**:
   - Be specific and descriptive
   - Include style and context information
   - Iterate on prompts for better results

4. **Error Handling**:
   - Check API key validity
   - Validate file sizes and formats
   - Handle network connectivity issues

## Common Issues and Solutions

### Git Push Errors (RPC failed; HTTP 400)
If you encounter large file push errors:
```bash
git config --global http.postBuffer 524288000
```

### Interactive Widget Issues
- Ensure `%matplotlib widget` is used
- Install required packages: `ipywidgets`, `matplotlib`
- Restart kernel if widgets don't respond

### API Rate Limits
- Implement retry logic with exponential backoff
- Monitor usage through OpenAI dashboard
- Consider batch processing for multiple images

## File Structure

```
project/
├── image1.png                 # Original image
├── generated_mask.png         # Generated RGBA mask
├── image1_edited.png         # Edited result
├── .env                      # API keys
├── requirements.txt          # Dependencies
└── openai_image_edit_exploration.ipynb
```

## Dependencies

Add to `requirements.txt`:
```
openai>=1.0.0
pillow>=9.0.0
matplotlib>=3.5.0
numpy>=1.21.0
python-dotenv>=0.19.0
requests>=2.27.0
ipywidgets>=7.7.0
```

This workflow provides a complete solution for interactive image editing using the OpenAI API, from mask creation to final result generation.
