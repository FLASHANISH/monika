Add-Type -AssemblyName System.Drawing

$assetsDir = Join-Path (Get-Location) "assets"

function Safe-Crop {
    param(
        [string]$inFile,
        [string]$outFile,
        [int]$cx,
        [int]$cy,
        [int]$size
    )

    $src = [System.Drawing.Bitmap]::FromFile($inFile)
    $half = [int]($size / 2)
    $x = [Math]::Max(0, [int]($cx - $half))
    $y = [Math]::Max(0, [int]($cy - $half))
    
    if ($x + $size -gt $src.Width) {
        $x = [Math]::Max(0, $src.Width - $size)
    }
    if ($y + $size -gt $src.Height) {
        $y = [Math]::Max(0, $src.Height - $size)
    }
    $w = [Math]::Min($size, $src.Width - $x)
    $h = [Math]::Min($size, $src.Height - $y)

    $rect = New-Object System.Drawing.Rectangle($x, $y, $w, $h)
    $crop = $src.Clone($rect, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

    $finalBmp = New-Object System.Drawing.Bitmap(512, 512, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($finalBmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.DrawImage($crop, (New-Object System.Drawing.Rectangle(0, 0, 512, 512)))

    $finalBmp.Save($outFile, [System.Drawing.Imaging.ImageFormat]::Png)

    $g.Dispose()
    $finalBmp.Dispose()
    $crop.Dispose()
    $src.Dispose()
    Write-Host "Created $outFile"
}

# Crop face-6 with higher cy to capture both eyes and forehead
Safe-Crop -inFile (Join-Path $assetsDir "monika-6.png") -outFile (Join-Path $assetsDir "face-6.png") -cx 580 -cy 210 -size 360

Write-Host "Re-created face-6 successfully!"
