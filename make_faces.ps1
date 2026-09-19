Add-Type -AssemblyName System.Drawing

function Rotate-And-Crop {
    param(
        [string]$inputPath,
        [string]$outputPath,
        [int]$rotateType, # 0 = None, 1 = Rotate270 (90 deg CCW), 2 = Rotate90 (90 deg CW)
        [int]$cx,
        [int]$cy,
        [int]$size
    )

    $fullIn = (Get-Item $inputPath).FullName
    $fullOut = (Join-Path (Get-Location) $outputPath)

    $src = [System.Drawing.Bitmap]::FromFile($fullIn)
    if ($rotateType -eq 1) {
        $src.RotateFlip([System.Drawing.RotateFlipType]::Rotate270FlipNone)
    } elseif ($rotateType -eq 2) {
        $src.RotateFlip([System.Drawing.RotateFlipType]::Rotate90FlipNone)
    }

    # Save upright full image if requested
    if ($rotateType -ne 0) {
        $uprightPath = (Join-Path (Get-Location) "assets/monika-4-upright.jpg")
        $src.Save($uprightPath, [System.Drawing.Imaging.ImageFormat]::Jpeg)
        Write-Host "Saved upright image: $uprightPath ($($src.Width)x$($src.Height))"
    }

    # Crop square around face
    $half = [int]($size / 2)
    $x = [Math]::Max(0, [int]($cx - $half))
    $y = [Math]::Max(0, [int]($cy - $half))
    if ($x + $size -gt $src.Width) { $x = $src.Width - $size }
    if ($y + $size -gt $src.Height) { $y = $src.Height - $size }

    $rect = New-Object System.Drawing.Rectangle($x, $y, $size, $size)
    $crop = $src.Clone($rect, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

    # Apply soft oval mask for smooth 3D cameo blend
    $finalBmp = New-Object System.Drawing.Bitmap(512, 512, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($finalBmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

    # Draw the cropped image resized to 512x512
    $destRect = New-Object System.Drawing.Rectangle(0, 0, 512, 512)
    $g.DrawImage($crop, $destRect)

    # Save the face texture
    $finalBmp.Save($fullOut, [System.Drawing.Imaging.ImageFormat]::Png)
    Write-Host "Created face crop: $outputPath ($($src.Width)x$($src.Height) -> face at $cx,$cy)"

    $g.Dispose()
    $finalBmp.Dispose()
    $crop.Dispose()
    $src.Dispose()
}

# 1. monika-1: centered around (410, 670), size 480
Rotate-And-Crop -inputPath "assets/monika-1.jpg" -outputPath "assets/face-1.png" -rotateType 0 -cx 410 -cy 670 -size 480

# 2. monika-2: face is around (570, 580), size 460
Rotate-And-Crop -inputPath "assets/monika-2.jpg" -outputPath "assets/face-2.png" -rotateType 0 -cx 570 -cy 580 -size 460

# 3. monika-3: face is around (500, 580), size 500
Rotate-And-Crop -inputPath "assets/monika-3.jpg" -outputPath "assets/face-3.png" -rotateType 0 -cx 500 -cy 580 -size 500

# 4. monika-4: upright, face is around (840, 300), size 480
Rotate-And-Crop -inputPath "assets/monika-4.jpg" -outputPath "assets/face-4.png" -rotateType 1 -cx 840 -cy 300 -size 480

Write-Host "All faces generated successfully!"
