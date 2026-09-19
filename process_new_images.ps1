Add-Type -AssemblyName System.Drawing

$uploadDir = "C:\Users\hp\.gemini\antigravity\brain\6553fe74-15b7-4222-84a2-10d6f17bef49\.user_uploaded"
$assetsDir = Join-Path (Get-Location) "assets"

# 1. New Royal Sari Sitting Photo -> assets/monika-5.png
$sariSource = Join-Path $uploadDir "media_1789755654322.png"
$sariDest = Join-Path $assetsDir "monika-5.png"
Copy-Item $sariSource $sariDest -Force
Write-Host "Copied monika-5.png successfully"

# 2. Long Hair Portrait (Rotated 270 / 90 CCW to be upright) -> assets/monika-6.png
$hairSource = Join-Path $uploadDir "media_1789755633045.png"
$hairDest = Join-Path $assetsDir "monika-6.png"
$bmp6 = [System.Drawing.Bitmap]::FromFile($hairSource)
$bmp6.RotateFlip([System.Drawing.RotateFlipType]::Rotate270FlipNone)
$bmp6.Save($hairDest, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp6.Dispose()
Write-Host "Saved upright monika-6.png"

# 3. Crop face for monika-5 -> assets/face-5.png
# In monika-5.png: Monika sitting, face is at top right (x ≈ 420, y ≈ 410, size ≈ 280)
$sariBmp = [System.Drawing.Bitmap]::FromFile($sariDest)
$faceSize5 = 320
$cx5 = 430
$cy5 = 400
$rect5 = New-Object System.Drawing.Rectangle([Math]::Max(0, $cx5 - [int]($faceSize5/2)), [Math]::Max(0, $cy5 - [int]($faceSize5/2)), $faceSize5, $faceSize5)
$crop5 = $sariBmp.Clone($rect5, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$finalFace5 = New-Object System.Drawing.Bitmap(512, 512, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g5 = [System.Drawing.Graphics]::FromImage($finalFace5)
$g5.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g5.DrawImage($crop5, (New-Object System.Drawing.Rectangle(0, 0, 512, 512)))
$faceDest5 = Join-Path $assetsDir "face-5.png"
$finalFace5.Save($faceDest5, [System.Drawing.Imaging.ImageFormat]::Png)
$g5.Dispose()
$finalFace5.Dispose()
$crop5.Dispose()
$sariBmp.Dispose()
Write-Host "Created face-5.png"

# 4. Crop face for monika-6 -> assets/face-6.png
# In upright monika-6.png: Dimensions 1024 x 575.
# Face is smiling with hand under chin
$hairUpright = [System.Drawing.Bitmap]::FromFile($hairDest)
$faceSize6 = 380
$cx6 = 580
$cy6 = 320
$rect6 = New-Object System.Drawing.Rectangle([Math]::Max(0, $cx6 - [int]($faceSize6/2)), [Math]::Max(0, $cy6 - [int]($faceSize6/2)), $faceSize6, $faceSize6)
$crop6 = $hairUpright.Clone($rect6, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$finalFace6 = New-Object System.Drawing.Bitmap(512, 512, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g6 = [System.Drawing.Graphics]::FromImage($finalFace6)
$g6.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g6.DrawImage($crop6, (New-Object System.Drawing.Rectangle(0, 0, 512, 512)))
$faceDest6 = Join-Path $assetsDir "face-6.png"
$finalFace6.Save($faceDest6, [System.Drawing.Imaging.ImageFormat]::Png)
$g6.Dispose()
$finalFace6.Dispose()
$crop6.Dispose()
$hairUpright.Dispose()
Write-Host "Created face-6.png"
