Add-Type -AssemblyName System.Drawing

$conceptPath = (Join-Path (Get-Location) "assets\monika-avatar-concept.jpg")
$src = [System.Drawing.Bitmap]::FromFile($conceptPath)

# 1. Full-body standing avatar
# X: 630 to 865, Y: 65 to 550
$rectAvatar = New-Object System.Drawing.Rectangle(630, 65, 235, 485)
$cropAvatar = $src.Clone($rectAvatar, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

# Create 512x1024 high-res transparent standing avatar with feathered edges
$avatarBmp = New-Object System.Drawing.Bitmap(512, 1024, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$gA = [System.Drawing.Graphics]::FromImage($avatarBmp)
$gA.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$gA.DrawImage($cropAvatar, (New-Object System.Drawing.Rectangle(20, 20, 472, 984)))
$avatarBmp.Save((Join-Path (Get-Location) "assets\avatar-standing.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$gA.Dispose()
$avatarBmp.Dispose()
$cropAvatar.Dispose()
Write-Host "Created assets\avatar-standing.png"

# 2. Perfect close-up face crop from the left portrait
# Face center is around (420, 280), size 380x380
$rectFace = New-Object System.Drawing.Rectangle(230, 90, 380, 380)
$cropFace = $src.Clone($rectFace, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$faceBmp = New-Object System.Drawing.Bitmap(512, 512, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$gF = [System.Drawing.Graphics]::FromImage($faceBmp)
$gF.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$gF.DrawImage($cropFace, (New-Object System.Drawing.Rectangle(0, 0, 512, 512)))
$faceBmp.Save((Join-Path (Get-Location) "assets\avatar-face.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$gF.Dispose()
$faceBmp.Dispose()
$cropFace.Dispose()
Write-Host "Created assets\avatar-face.png"

# 3. Four angle crops (FRONT, LEFT, BACK, RIGHT)
$angles = @(
    @{ name="front"; y=70 },
    @{ name="left";  y=185 },
    @{ name="back";  y=300 },
    @{ name="right"; y=420 }
)
foreach ($a in $angles) {
    $rect = New-Object System.Drawing.Rectangle(880, $a.y, 95, 95)
    $crop = $src.Clone($rect, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $outPath = (Join-Path (Get-Location) ("assets\angle-" + $a.name + ".png"))
    $crop.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $crop.Dispose()
    Write-Host "Created $outPath"
}

# 4. Four outfit style crops
$styles = @(
    @{ name="default"; x=362 },
    @{ name="simple";  x=438 },
    @{ name="trad";    x=510 },
    @{ name="casual";  x=584 }
)
foreach ($s in $styles) {
    $rect = New-Object System.Drawing.Rectangle($s.x, 560, 68, 80)
    $crop = $src.Clone($rect, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $outPath = (Join-Path (Get-Location) ("assets\style-" + $s.name + ".png"))
    $crop.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $crop.Dispose()
    Write-Host "Created $outPath"
}

$src.Dispose()
Write-Host "All avatar elements extracted successfully!"
