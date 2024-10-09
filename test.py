from PIL import Image
import requests
from io import BytesIO

res = requests.get('https://media.npr.org/assets/img/2017/09/12/macaca_nigra_self-portrait-fd5e770d3e129efe4b0ed6c19271ed29afc807dc.jpg?s=1100&c=85&f=jpeg')
img = Image.open(BytesIO(res.content))
# img.show()