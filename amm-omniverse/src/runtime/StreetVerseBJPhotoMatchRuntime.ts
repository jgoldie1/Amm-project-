import * as THREE from 'three'

export const BJ_PHOTOMATCH_ASSET={
  id:'streetverse-bj-stubbs-photomatched',
  characterId:'bj-stubbs',
  version:'bj-v10-approved-reference-landmark-head',
  source:'user-approved-current-era-reference',
  textureAuthority:'approved-reference-pixels',
  geometryAuthority:'runtime-v10-landmark-volumetric-head-profile',
  certifiedLikeness:false,
  proceduralFallback:'streetverse-hero-player',
} as const

export const BJ_V10_HEAD_PROFILE={
  version:'bj-v10-head-geometry-1',
  characterId:'bj-stubbs',
  intent:'current-era-likeness-profile',
  headWidth:.575,
  headHeight:.745,
  craniumDepth:.50,
  jawWidth:.405,
  jawHeight:.285,
  jawDepth:.385,
  cheekWidth:.30,
  cheekDepth:.030,
  noseBridgeProjection:.024,
  noseTipProjection:.046,
  chinProjection:.030,
  foreheadSlope:.018,
  templeTaper:.94,
  skinHex:0x70462f,
  skinShadowHex:0x5f3929,
  beardDarkHex:0x17110f,
  beardGrayHex:0x6e6965,
  referenceNotes:[
    'lean mature jaw',
    'defined cheek structure',
    'natural eye spacing',
    'subtle brow ridge and orbit depth',
    'moderate lip/philtrum projection',
    'full gray-forward beard with longer lower-chin silhouette',
    'long pulled-back loc silhouette',
  ],
  certifiedLikeness:false,
} as const

export const BJ_V13_HEAD_DETAIL_PROFILE={
  version:'bj-v13-approved-reference-depth-1',
  characterId:'bj-stubbs',
  browProjection:.010,
  orbitRecess:.012,
  upperLipProjection:.009,
  lowerLipProjection:.012,
  lowerJawSideTaper:.009,
  intent:'additive-depth-from-existing-approved-reference-not-new-likeness-claim',
  certifiedLikeness:false,
} as const

export const BJ_PHOTOMATCH_TEXTURE_DATA_URI='data:image/webp;base64,UklGRsAfAABXRUJQVlA4WAoAAAAQAAAAvwAAvwAAQUxQSG8HAAAB/yckSPD/eGtEpO4TDtu2kaTNPBhnV9t/wXfxzj0FRPR/Ao6fjKd30QAqgPYOoFdjOZlpxEIV3hCb4heuTWG01prV2sd4ApvWttPBm84pZ6YhSUZmGiAVHXIWr1EDxZ9kMGzbNozk/79e4xTrAxExATxpjOePZcAcUchZwRmd4nqi45o/8H/7gf3kYzZ2VMuGBnGiQaCBCcij3PYkybZsS5Ik4f4szCyfef5Drd+9mxr3sZb/al1ExAT4liTJkiTJtpA0/v93617BD2ZefQmzeo6ICYDbSJIjqUjP7L///n4rq+UzMSImwP/T75fQjb+RnnTp0hv1e0/lNNM5n2faJr7Sj4jSdu55HsfxeDwePx/H4ziOPZf0DKnO18w89/Pj4/XT59fPr7///vuHD+9/e+cN7PT9159//vH7b7/++suvv/zy9du37z9+HI/z2FZvQGsp2XptnbVnu2venSoiRO3+/jtfp3OtDCzKmyBJ77FBNVtKlfzMqFXpcGAqp7ZEprWoRI5lI2Vld0ryY1NxUiWVWlUqZFZa6T6SJtJWUZEfHGonp32lTawtm2TBI0c5smw1/dIS8qOLUs6himZtSwWfpLK6tnYqZaMkP3xRqnQYZFUb/A2kSt1IUrGVFslPb2kdOaWLSquK1kp1vBijSVt2bB40mZkYW62LWQ5VvhhIO23IoxZxx1Q2AsvJxcuYpsom9iwl1+8jzdSyG8FaR31hiK1kzYMmWWYprFRxYEe+tGNclrXysIOYcQgqmxrWUToGlXY29TBybegQWauGdpSvFhqblvUG5/5wXJtaBXa6clxLm8geB7GdUkrKNrAg1emc6nRKeeCgOSqqxIH5JVU6VYKeJ7mtOCtiA2ukUieVUnnihOWUSolTVrKxS6erKj3RbZLOqnadyBxvOoxBefTEyuGoTZwK3W4kqlRKzyTXdDXFLi2zjW7KNY/d5Shhm93wsPmY8twhnGBm33dgk5nMSor0XELua63dsiYGsybzkkWizTOsdqAJue3xgh2CW5qBGFJ59nwuyx7YNCPlNQsRB55htSOzUFSP93HVDru0aUjNa5bMOtCtTJrwxIZ6gcimvo/6fkZg70tYE3o+cj07si5KaqEa17xhbivKLWuaRDd6g88pPMNqo2l/8ZLdFZzCMlHzpN4hd5SeYU0i1rxpSJJTVtOk3O1u8gQt0qXXyDU5c2mJJKO3wFBiaB49e9UipA4tRUK9x33CVCYl0RTzrotjx4nA3iaJvO6OlaYkKRHrdkskcNbsJHqTjzVjVr2T3HORhnUidENBcWFnJ+V2a9ISs2qSO14hOayThdTLMD2CXnaied1orWZ1apLxtk2WEtYxBb2OTBGzKsgtByU0zZr0QoiY1iTjhcP6eaaG7ojAtCI3vaJvgaY3aiI0xOSVTIzLkJtuWPDIjYfNSsreqIgseuG8EVLoUfLi2ax/gxY9eq8KPf8Czbr2dv+A/U0XdF8VLYvc/Yod3Vy7rGu6s7/+CntTKQtLytxREe3iIrddrfjTazVoWaWY7mhnkgxzm1eeZFawIm+dKRu30Cs1YQWzyN6oyWQDK7J0P9cdWtYi8sJNyIZVcu1+NCKZtUWy7qYRF/ilRXM3hJo1qxCpm8lIbFibLm9crmvBNpHupkYSGRZJ62aIJxvYHgTdTJMm1rRISncSUdjQFHK/TWpi5UyrVt1JECyZxFkLR7qVlYSvsPZ0qFW6k2tNUbSko1ZKudURKVnocyOSdBd9SGxoopDcZuxSYws7z5JaeothaFYiw3aJFK23IIlSWceG2qGW96xJsbDzpNYR8orDoBVsWMfCIQXdQrSTCsHO40AcktfMFrJDyrGWlFrecC5Vs4JC4jxZHHH0BobaatazJR27kOp0fbzQbTtldoQ+j0YRKnq6+3OWggM7DaqU6ulu07Ea7LCOXdaK09XTp3t2gso6j7Z23Hd9tKikagLDjjXXkFx7MBG6iBmFtcdgdyXluXM9XUNjVNbRZjuM+dhjCcnNzjA7rPNcUIZ5lgefX06HNJe1p+LYxTz11IlmDHNVUUg5V8r8ekiP9HEYmdNqRrE7Gpknee5uVkrMda4WdcJM7YU9li4ZE/0DC73NfRFGpAeirDIVTFTYjn1WzTxyFzPa9JR9G9bOcFd4rLqR9Nwg06CtGDPqUOhZJGVlxYXSLqv0FI2ZciJ52sRm07Da0hds4UlM42UnHXneVFkRu3URzBrUKmMcHXqWRCqtLDNVDK3QpedLmEplDzJzo2UzMdtTKxhcTjUZOs7DKJVWlcwfhM+13bKYOOoweoKQjlNXYUabDC0tPd8QpaPv7439vHxMreTJbEHCl7RlK4yZXswYRvpRUbvn+chOiTG/lo1rYkmDmRfvXl5e5t28eFP72dnZnl01ZMmWDEs69zweP398//bt25evX75+/fbt54+fx6OXmRn6WVHt7m8fPnz8/fX10+dPnz6/vv7+8Znbxl4YSrt7nsfxeDx+Ph4/H8fjPM7drfKveVwH4zre3C5duuy305PQk96e//v/37cBAFZQOCAqGAAA8FwAnQEqwADAAD5JIo1EoqIhJSeVO9igCQljB+8lFiGLu+vXgxrh6RfJ/iP8n06LjTEnmYPf/8z1Z+Yh4y/r1/b31OfuD6qv/K9bu8zegh+p3p0+yn/ZP91+4PwGfsn/581V7iP8t4R/j/z7+T/s/7j/3/2yv8Lx+9Zeav8j+6n7H+/elfgr8atQ78h/pH+n/Mf3rIGfRb7P0DvdH7P/yvCX1WfEnsAfzn+sf7T82ecl+9f8L2Av6X/cP+v/h/yZ+l/+2/9f+1/zf7Ze4D6g/8P+r+Af+d/1//k/cv4VfRl/c06YGLwr/oV/ht++o/PLFhv5loVACyHiJMFlYowVTIkvoXyKkEhA+Yq0mgFfUfJ1PHNRJq4167vCOhy8LNJDWg1GL+jfrnTzFYZTcKsVKfPc7C6XuOuiKe4aCTnJ5Cn5t0lCLi5wcct+1x5XZRu37YLyzg7BFkf/93DfibGYy/ekCAjxx2FmjipQznG4LB8xG8Z4D0Wwg8wxQDfFGMHg9A9KkAW/t2X32jAcHYmTzEqLnUQ86RHBQ6jdcyC7Bt0DAeb3dLjp09dpB/SysRwVTM3w7z9swLHQ9r5U5AAdC5qJpeWiU/LQM/xQrkzhrLU8eFNt+TB7vqRtt7iCxYMAiPc4FAqBgzZlhbxXTiJIcspP/rywpdUgsO0tSr+KYPdmRrFD8HdD0F5iLNWBZ1ugZqtfTrh62oxgFtcpjorG+pdPcbSAt0vp0FwtuCrNesFM5soPKZ1OSZNGJaAVOLDoKrTyJ5COs7b9x+TpsfdJpcRa3T9bFH+IYTX0e5UT9FkqyX7sGyxSkzfTLzsK6U6Ah3LSQ9Nr+AAcx2HbdCLUnLZpulKyHn03yyGy1EZ6Fmw0NP5ylwMId6/O/0RzZGZJBIQpNDO5DlUyurJkTyfj2R+vZs22SXNqtl3VNLVA6leYRlxu99e7Vaj3+wpsyZr/00MSd8b5Vu6W7//JKFr9J782b9JcbBtWwsHYWDsLBMAA/v5HgAAJD/+3UKX8PXtdVZrhb/lqZKV5wD1CLwQ3rP/xWRD7DRH+a0HPntuC4sOd2BVohdOlSiZKtreruwRqd49RAWv9+SfRh67hTipWTxmlW/sDCmrbyTd54SXdO/rkZquGq1rvX8Xz/Mf3S5OtTIxAEt/WoKn+MxvbkR1b24M+fJUNy0dSCzpTIZQgBNbU2TwR2wx5QDx48HZ+Bh/U4GNhrAHP0zDkixERtY+hz/vbM/HDQuqc0o1f1FlOFGcxuE5QLMpQh1xjt3iGOiE27xvNSj1/Hv+hreL2l/yqGiWpTYJsadTaX61o4YKFZyuRDLwKbeAJJXJamF3oD4bKeME7vkc89rpkPhLrDDKqgEsMfbsZirxc1Elw+FywH0wiEuR8gUVZmWbC93rnDBllDnywuhqCbOKeNb6NbF892Aeena9HIBeEh/gLggvKYuKbktG2YiUBi8rgihLNbL8Uxa+yctVLnw30cNMKCJ0RdzwFrzyBN0+6EeiwpB6zrydkOA/XJK/cU9+Afp6jl3conYBB8jd4f4Bd3QLo5zO/RsFz8yhn7yXnIFh7updag3+9D335EVByVDqj4K/j3yXuDhQRyK+LHZPPeLQqd9rsdbQH5cUt/CbQ75wmwoJAUySHMVpr7BX48jCJWu7dNzVlG2s9JOwBMXuMF8Qu6Z/TV9S3QjnuOFCv/4me4YMo3VaW5nTBUJAHQB7gxh/u8b4K738iep8NNRC9eoVF+3dff0AK4EcLQL03sN8dOMB6HsqHMsCQ1LNt2RAKLxXS1zZloUWqALKLl2EhOwVMUQeyT2PuFYxolL8roNEREMtG81Z8xbgzOl/h5Z+WEoewGLujTeW9HF1CZA/jmoqA3UoH063s0EdgavjQcy5foPJPGBnGJv/Ag0tJmqmdFqLdtYeo2Ri0vqRFJ9W9m5yjYdPfYu5rDV+z9wBGnQsidvvAQllKejRbaiDNK5J8gIe6GelYBh3oCjT0LS+rWB7wcPt1f/7WlRh+H7cXZJRH7VV15qRo7C4h+u9vaf8KkMKWkNPbRWoTDmuTaNVhJEPlhmI6yfCIipT6ajdkOylp4aJz77cgimpnK/T+wlOwNVm/P9BVcK7FfW0xXPtT6GN6f3b+5OHoUO256IoWg9tGu81sFv8zQmiYx2EatbIQz46Fzfh7ydNnjKs1BCLq7GhCgHSjc1YE+koGBnJqhA2i+o4BHuPMf6iAil5IDrPZNuGb2YE41syk1g81H+akwGoLOd5igOKqnCaKkOCeT0wBxRVbz6jFFzdKU1RFyYQu3F9jePgZdfFogZd7qhNSz73bXFdw4isntC07dPcNqY8Hpqd+X7kQ2gt0nFXm4sGpoe3pmUmDk0yuHlhtnjJO9b6qfTw1jWfNwmq7tORuzueVZI4XSKZ3dVlo2AC/lIWZ8lj4qNmReUvdKUoSsnPcUWpIPe5tfpYNl/HQkl+9w+ogMIfgr54aU0BjEb70ovYRa1/MoNtXHyCGYrAnKhazeVYTxOX4WoF//WnrY1pJSDu3pi3gb2lhu4MExONfvHHLl+cKqnBkcjif+7sbh8HO8rfAReQoNb0dV2bzOWqHEhFtT3mjopSeHex66E73ODIX21deqmjJlZz7qFvtdruDiTS2/pK9H5DeHrDhHxInq14Ym4G6m7jKI78LzfGnu9KAhX5xV7Z/iZvwexyXxx7Tc/zgzi9w44BKlUpLZAzrIyzLQ4QOKF8j+A6JMP2ZwUpXeEwq4XoLBpQIZSXCj+BnjX7bJxoE84jISOrROYKm8Dwslc3pPXwUZMznnR1Yzi45JotM4iGxqOlfgHUlP5IdfKpQ+KzPo6T9gjBWKmDfYa20TOgAT3hDks3k0X5O53k+e9beQA1//viSno6naXwy4c6Am9RoeW5yABhfpUbZWVdnBfDzgc9Cgfd/vRmyY14NmmZ9Z/jZoc5YxemUW9ljgj+3F+QSDB+1d9N7UKZw6iNQeXCOOeF4tGO/vz5LJLZsUCd4ANV1eHEIGQJXoguEPVQlQnOVplDmPs/6wf7tNJcF2KPfoqYMhvrFP1lUwIXu6ploelSjlMehjoPFOGId0QSYd8Wt/Hk+mKlSomVkwR7FwehiVAfDw6w2IhqrnATx4QbIL4i+C9/+haJaurrF8RnSA838Ri/MvtBZr0Br64BS71eDMPL9br4gT7ZNt+NiRbGtXOKh8TwMXZ27Sa2VGobmRwtMpOuRIr862DkYr9Fu7FrM30Q01RFUx9zm0QUQ0+RmCsnft5Y8YMnl3UK44R+ug4Y9d0Hf8wni3PQ7OMxOeIT6N3gdXL7sjRGhdoJPhS36ssL1w/k/5ZKnPccE3DUZtO2O1ooKOjHXKv4XGC40Rc2/0h9Fj4KM+JfyhSqnTauOYuOvIJwm9/P2u9jncyO09Ns5ffo4JEFMJPUn++We/xBwtXM92Xe+68DiQzb0eSM6yNd09P1yJ9wHxOE8QWbpZ7kwXAXniS+orQrKt3W+1+vFHLP+1GCPzi626k1qIz2wc/fpo0h9sCfgSYu9p+pvWB7g7m0tlXZL/hFoFjTZZkwMA/Ca1sVjfTyCnmEnmI/lnc8agHZ/uEm7UAb6ITftvEDraYlwgILAnYnnnLsCEdXVjO6kodDXrgJqK6tVUOWJJaN9uTtQczfAlyqH/RdlgJCwX55y1/5OYBDEjrqZHxGByx+lhvDn1S7Sb8zCZVfLs06BjXTFq9a+Z/CHYs5kqQ9lNbcw5+hcl5fMAMkC0N0nlaA15Ng9qEGME+MkYNh7Pdhj7HTO7IKiTEuKUEZbxgIL+306SIr7S8soD6RgT+wUqmDZSz0GlgaxmEKhYyQtqgqumREcXFyENjaMGajQ4WrnXw4MKtENoSOBvLu6wwr4i185EvdZKUnijpWhmQSdI2sOiYD91I8WDx+dwH1dKuzONzy4lDG/4uP8ejCRJ2QGsozPTeEsEtVaVg3DCkwdWR7c50skXHtjhdIheVYccv0FLUqYwkJC2LyfUWyCV4Tx3agflfL9NKMXJOPS3jtZjr7tq15YXe/lWiHpcGtf3V6ElVVk5o+zH9WQLLx0Ri5VvKmkPkxjGnt0l8bOCe7YWm4OENBfMCmnXkTBF9ni347iM8j6Nt1IFPIPnDqUlbuPRiKjVEJaycSyehuPz1H3JyVttmNtPjm4y2SU5SSQ6dcRjAfj2v9fsRiPQmmilsrEinf377CVLjcajN8YCEmoId+qQuhDj9qQRNyB0eYIhCYiCUUX0uq9oYpfDNyXsRHFcKztr8dhABYuJUQVNQHCpHi7dAB/8p5QpJAoo8vhIhTISk8u0M6nzEcdMWcHfi/hTp+9Nk5aFxgboWbnHXgzhLCnTyfb6+Q3brTi1vBguPzdz1xk3jz+LjABML2GrCvCs2wlLKcdo5Nf8y31V+0gwJ2O35rSid79zzm9bjdORqE0jVT1YUXyEEeoifGLhYH9DNxg2KGtjM57BWzhBB9N8NU89Fjh34xlf5rrrXjwl3du7xYFraIP6R5muE7Be5/+cseXu0xc7ZXzH+8hgRc+oTJySVFwjpIiXXAFuMHoRWVU4dgMgBltMOKyR3El+ujexh9PqmhUxlmAVQKfCzoMk/yQ/ExCofGL8O/qZGORuHS0CD44XYoXS1an98iJfuN5EVSsWxyB9ygKXvQSx44c49Zr9OqKZyS5u48gEl8l/9jDarh37GTKPZGY2nmXwNHkgmIQHBIcVZFa1I/cU56qbNHHloJegvvI6pDqH38aJlRFkyzgWc/bligc7NmJe40O+eRPzp6qUzjAosWbHA8/jW0odwu9YwO+6/7XtPc0IXijS2iYaYUF/B+2HJxmeh9wJKEOAwXV3ldjllg5YZRdQZAoaT+tLaMqWrvtEyDrZXoz1W6XEHBWKwyA83bY5Vajl8qlGy2ADE3j9w6ZDitM395i56b73/FE0W5XFfTlkZDR/kS6+L5h/DV7HVU8rB8jpQyphPmAzVILY3ZgsS7MU0iFKk/WhNIvFe18hi/2vVzOqPzJpX7aie0AoWYx8syumkeH3tlHb0XN7HPGEF9g6ij3Qzt3x95a9VPbePrZzIhGmscBMGrBQhJ22Ud5altyJ+SmGh92kWXSdBVUsLUgkyU1CfUr5x9cXtep5EUfAu19ng6InwPIjScC5r6wGYe5bIFnlQYHqxqinnrOEFYEV7jY2DXkFFNbmYr/yVa0JiIHdPe7D05LJQD+c95rZBytfbQJrJpI5pjz8Ywx4jsBvPphsP2NB1xQ3ei+byIXoqAJ1m7yA8tzPA1SOzK79usE6GwJ9GEgh570Dguu3Tvi/NzdYcjDqyqHkBG/ADzFMMQ9oT28yw6qfWojoXaVOudzOBT84sLhJ6JUAWdgT34J4HPC05bvweyWAoPdshwLyhZjZjRYmHZfG4pvmSc1HVe8kL+PrsqsbDMkSLBs07YhK9kAO2qtvRVPpJq7teIpS0571u/n6NdUx4ymQHg/wNoXNHgBZ7Ee4gzdM29bprMhYfCzKyNLTW5Qd4yYzMp3WWpF3L//DyMK+yEIaA2q6opaHPbC2tOs59FGVco9vPW69sxd3f2jIUMSHFlDSjhc0n4LXt0nJKP32sym53QY7IGT27pEc5cx8ue9j8l98g9yexYG+a1htEJ10f5cfSTf0HKZKj9sEcZJohfMLayPWy7pxolOR7afkbeqH+C9so0zwLPPweU4VWkPXnGHN8V+3EI4RzWuLfHGm0iyrnC4p14rga8RKnLKDngNz5aEJjBwIMPE/t53D4/FsgAb+HoHvdbobYOl5T+F3XOimtiprGCnxNPkDY6kUjujbfxDHMVDRUtT8tFO1ZMpLm6pm2e/ioS6TzFCnGCxFqtQpNnOWumMvWrzkIzAvSjPne4cFYgrtD6EA+eQR53sx+SDUUggKi9cUnI6O0iGVeigWwrWBRkH9egqs5NKPJDCcmgvweb8ebbsdDGDqNeTHHBU7pK2kAatmoRuvTsKOkuGMTxpUNHfd7E8A/fIoBFDYR11LYxAYpelfsMQ6iqBVG8z5QK3ePQAz/TETjuXlYIndDag/F87/6xS0R16FCRRVGjZ5dc3u/olcp2Zo1BwW6Nv5imGlIno81yJPrFJa6BYdarf+XlHw4bs7m6DticvlvNmEXCzkObcQvcIvrYi3tbkPBDIWoczFFwwh0FBCA/k4vf88N+rgsT+DXKzmR9Vi0+jsg0d+d7YIoIMEfKCd+l72Q0Pu4pXXwdywUJaXO65t91iskqrbEMcZVf6pg9+3+G6X9F1DPPBmB+iFjLgqdx+tUWQw/RadsGe4d9eOsTNS5efT5u6EY7Py/hDwF/Aemdh3TpO1nsN2nBXKmoahwDGQMVey/dAi/hAcc28XjLdBg17fmuW1CiKBXgY2lQE76w3qgo5qVnSS3uOiMLioFSEu5TjZt4BsJkk1CWBalu0NL9zEk5ookD7FetYxnrupfXusNHbwWWpObkEUHWAoXmxBInhhWgtgh+Og3sSwqy08fXmD8E3T1Yub0SMcMUCDnSO/Ow92ebSQ7ojBsZlU/BwFHIyR7XrCMzXahl+/N2stKnPUqbhSVIM+H2crYfHbxROJXjanxpDgY50d1zVs/q0JwiCgxhGkjO1j6H+Fv5GH3RRfX7wfQfKxAxYjmKcRZ4cfWi7K/8SwlBJOMUPm/BIJmEu4KP4GtYINDsk5EO21mz6tiORKFSx/P1YeG4UoE0tGWM5I4ZTYGAEt1qRdZ3307Cy0tY7R5cSBjV1Mptfc1rVW8XjFp1BoTo6b2lwj7HVIx1M2QeM6z4RNTc+80UJFvRJxpAH2wMbC2bmRfLnADyrACP/V7O4Rnbtgu7eu8Skj4MONfxK+l77UxUPXxNyNU5vIRRc3wZk/K3x7edvlpU5f2OE3nskFq2RT8NNIFMaSys9UMcgGdryaj2qIaMYxst0IasBBzwX260RUc0DM9O51RDGzTGZTUHZWjeVui2q5J++AqVOIIFevSog88sA4l1h6hopYbcvG1ILCocqM2eAyQDxo+9AfuI8USB6a6PTZ1Hh2PF76X51eqaDBGdl5y1mt35oPSgi70/Cwyw/jv5XV42aorIiM0uuuBTbBkfIphsb6+fgCUMIaSBeyva3DJRstt+fgm3+f8PikH4dVA+AD+/4lNw7iokBCdl9Y+El/9nD3zCqXSk8MXaOekqCN9bzgdTv3zss12HcNR38L6aLeuOnT0s/rnOl/hhZZBqWoL8P4nD9OBHmvI+urF8VQraZV0Lq0UeT5ca5X/ZDukKE5/qmEymx7mPW8Zk/ymR9s20/DPivBcUP/J6gft2TF5cZzIPysHa1CBypUXWmwUqfCfl2MUo4zfAHt/vfhSZCXwBW2d03x6is443ODzFuDbZ2PP/VUP1YdhxpkP1lZukhzDSlOpyUxThSvrXYR2KV5xFWRmKEucDvU296LIzBv7WFtwM/qENLUBJIX539VX/maX+KAYXW+aIP+x8rryBMl5+p+Nxl8B15k26URzT23JPjfrnfr9N3jPxTKuPfMl+R1y5uyetIEUUUCw8/857csA+zo5w5oP04QDVblgsco+VkJOaMtVUHu3Ea1TD+IgtznrkyvJG6dpQH76izj6MKHWSYMiu3z3k59vwSwUgOt0Jlu424SeF8g/F6mjRlZAe8DVjHGRRjdXZCAScjhQYP/bZr7/i+dObaYuBuut2C2W6zmuLrK/PwJeaRLBsDUYICEtV3a0ndiZTtAlBekOkqvCdi8ZdlBR7TwKsqu2+YOpFrYQy4DRzP6E6vmpx/Cvb37m1aTPXQ40KyzE8bHwyoKU12NxVjw8KVkTwq+fJknOtW1voFDovkvUFvMXXuIPxzMe3AxAfU8fyESBJhHJNLBObPYwodVP0pqje7I8b9C245rgoJzYSm0LrJ8+F0O/9nDw+z6MNE+uA666H8J3mcSyxPjh3pZo0U92l/gmTXH2qQ1XKVYynxiAY5xP2uq8dKD3omPulnYeNFyyGwBYHEEukqdtmb/4VWuNAfMj0JxQILSnzbHSPWyzf/ka8qJJVmIFHr55mIWhNoBXEBEFcYGUQRLyKqQrzkzvk8OHpxNUyaZVDs0+IrOM+5gPsGBU6okAuAXvd/hyD8OBOp7LWOLHY78OA1eslVYNu4mijat4spBs4b5NCXX1Wehu+VMmmiNcwyszON7efkB/OO2AXR2CZSDw8F5Vrk96toEOEBJdMJ80gzIeORaAYXFfoVd8wXfgcfPLo71YEAAAAAAAAA'

const PROCEDURAL_FACE_PARTS=new Set([
  'hero-head','jaw','chin','cheek-left','cheek-right','nose','upper-lip','lower-lip',
  'eye-white-left','eye-white-right','iris-left','iris-right','eyelid-left','eyelid-right',
  'brow-left','brow-right','bj-nose-bridge','bj-nose-tip','bj-jaw-shadow'
])

function featherPhotoTexture(source:THREE.Texture){
  const image=source.image as CanvasImageSource|undefined
  if(!image)return source
  const canvas=document.createElement('canvas')
  canvas.width=256;canvas.height=256
  const ctx=canvas.getContext('2d',{willReadFrequently:true})
  if(!ctx)return source
  ctx.clearRect(0,0,256,256)
  ctx.drawImage(image,0,0,256,256)
  const pixels=ctx.getImageData(0,0,256,256)
  const d=pixels.data
  for(let y=0;y<256;y++)for(let x=0;x<256;x++){
    const nx=(x-128)/(256*.49)
    const ny=(y-132)/(256*.53)
    const ellipse=nx*nx+ny*ny
    const edge=THREE.MathUtils.clamp((1.08-ellipse)/.22,0,1)
    const forehead=THREE.MathUtils.clamp((y-2)/22,0,1)
    const chin=THREE.MathUtils.clamp((254-y)/20,0,1)
    d[(y*256+x)*4+3]=Math.round(255*edge*forehead*chin)
  }
  ctx.putImageData(pixels,0,0)
  const feathered=new THREE.CanvasTexture(canvas)
  feathered.colorSpace=THREE.SRGBColorSpace
  feathered.anisotropy=4
  feathered.needsUpdate=true
  return feathered
}

export type BJPhotoMatchedHeadHandle={
  mesh:THREE.Mesh
  geometryGroup:THREE.Group
  ready:Promise<boolean>
  dispose:()=>void
}

export function installBJPhotoMatchedHead(hero:THREE.Object3D):BJPhotoMatchedHeadHandle|null{
  const headPivot=hero.getObjectByName('rig-head')
  if(!headPivot)return null

  // V10 keeps the approved front reference while adding profile geometry for
  // brow/orbits, temples, lips and beard line on top of the V9 skull/jaw volume.
  // The reference pixels remain the visual authority; geometry is approximate.
  const geometry=new THREE.PlaneGeometry(BJ_V10_HEAD_PROFILE.headWidth,BJ_V10_HEAD_PROFILE.headHeight,34,40)
  const positions=geometry.attributes.position
  for(let i=0;i<positions.count;i++){
    const x=positions.getX(i)
    const y=positions.getY(i)
    const rx=x/(BJ_V10_HEAD_PROFILE.headWidth*.5)
    const ry=(y+.010)/(BJ_V10_HEAD_PROFILE.headHeight*.5)
    const ell=Math.max(0,1-rx*rx-.88*ry*ry)
    const cheekLeft=Math.exp(-Math.pow((x+.135)/.105,2)-Math.pow((y+.035)/.145,2))
    const cheekRight=Math.exp(-Math.pow((x-.135)/.105,2)-Math.pow((y+.035)/.145,2))
    const cheekDepth=(cheekLeft+cheekRight)*BJ_V10_HEAD_PROFILE.cheekDepth
    const noseBridge=Math.exp(-Math.pow(x/.055,2)-Math.pow((y-.045)/.145,2))*BJ_V10_HEAD_PROFILE.noseBridgeProjection
    const noseTip=Math.exp(-Math.pow(x/.062,2)-Math.pow((y+.052)/.070,2))*BJ_V10_HEAD_PROFILE.noseTipProjection
    const chin=Math.exp(-Math.pow(x/.115,2)-Math.pow((y+.285)/.080,2))*BJ_V10_HEAD_PROFILE.chinProjection
    const forehead=Math.exp(-Math.pow(x/.22,2)-Math.pow((y-.245)/.13,2))*BJ_V10_HEAD_PROFILE.foreheadSlope
    const browLeft=Math.exp(-Math.pow((x+.105)/.080,2)-Math.pow((y-.095)/.052,2))
    const browRight=Math.exp(-Math.pow((x-.105)/.080,2)-Math.pow((y-.095)/.052,2))
    const browDepth=(browLeft+browRight)*BJ_V13_HEAD_DETAIL_PROFILE.browProjection
    const orbitLeft=Math.exp(-Math.pow((x+.102)/.075,2)-Math.pow((y-.045)/.045,2))
    const orbitRight=Math.exp(-Math.pow((x-.102)/.075,2)-Math.pow((y-.045)/.045,2))
    const orbitDepth=(orbitLeft+orbitRight)*BJ_V13_HEAD_DETAIL_PROFILE.orbitRecess
    const upperLip=Math.exp(-Math.pow(x/.110,2)-Math.pow((y+.133)/.030,2))*BJ_V13_HEAD_DETAIL_PROFILE.upperLipProjection
    const lowerLip=Math.exp(-Math.pow(x/.118,2)-Math.pow((y+.164)/.032,2))*BJ_V13_HEAD_DETAIL_PROFILE.lowerLipProjection
    const jawSide=Math.exp(-Math.pow((y+.205)/.135,2))*Math.max(0,(Math.abs(x)-.135)/.14)*BJ_V13_HEAD_DETAIL_PROFILE.lowerJawSideTaper
    const temple=Math.max(.88,1-Math.max(0,Math.abs(x)-.20)*.35)
    positions.setZ(i,(.282+.105*Math.sqrt(ell)+cheekDepth+noseBridge+noseTip+chin+forehead+browDepth-orbitDepth+upperLip+lowerLip-jawSide)*temple)
  }
  positions.needsUpdate=true
  geometry.computeVertexNormals()

  const material=new THREE.MeshStandardMaterial({
    transparent:true,
    opacity:0,
    alphaTest:.04,
    side:THREE.DoubleSide,
    roughness:.69,
    metalness:0,
    emissive:new THREE.Color(0xffffff),
    emissiveIntensity:.10,
  })
  const mesh=new THREE.Mesh(geometry,material)
  mesh.name=BJ_PHOTOMATCH_ASSET.id
  mesh.position.set(0,.004,.015)
  mesh.scale.set(.985,1.018,1)
  mesh.renderOrder=28
  mesh.frustumCulled=false
  mesh.userData={...BJ_PHOTOMATCH_ASSET,photoReferenceTexture:true,active3DMesh:true,volumetricHeadV10:true,facialDepthPass:'bj-v13-brow-orbit-lip-jaw',headDetailProfile:BJ_V13_HEAD_DETAIL_PROFILE.version}

  const geometryGroup=new THREE.Group()
  geometryGroup.name='streetverse-bj-v10-head-volume'
  geometryGroup.userData={characterId:'bj-stubbs',version:BJ_V10_HEAD_PROFILE.version,volumetricProfile:true,facialLandmarksV10:true,facialDepthPass:'bj-v13-brow-orbit-lip-jaw',headDetailProfile:BJ_V13_HEAD_DETAIL_PROFILE.version,certifiedLikeness:false}
  const skinVolume=new THREE.MeshStandardMaterial({color:BJ_V10_HEAD_PROFILE.skinHex,roughness:.67,metalness:0})
  const skinShadow=new THREE.MeshStandardMaterial({color:BJ_V10_HEAD_PROFILE.skinShadowHex,roughness:.72,metalness:0})
  const beardDark=new THREE.MeshStandardMaterial({color:BJ_V10_HEAD_PROFILE.beardDarkHex,roughness:.94,metalness:0})
  const beardGray=new THREE.MeshStandardMaterial({color:BJ_V10_HEAD_PROFILE.beardGrayHex,roughness:.96,metalness:0})

  const cranium=new THREE.Mesh(new THREE.SphereGeometry(1,32,24),skinVolume)
  cranium.name='bj-v10-cranium'
  cranium.scale.set(BJ_V10_HEAD_PROFILE.headWidth*.505,BJ_V10_HEAD_PROFILE.headHeight*.505,BJ_V10_HEAD_PROFILE.craniumDepth*.50)
  cranium.position.set(0,.010,.055)
  geometryGroup.add(cranium)

  const jawVolume=new THREE.Mesh(new THREE.SphereGeometry(1,28,20),skinVolume)
  jawVolume.name='bj-v10-jaw-volume'
  jawVolume.scale.set(BJ_V10_HEAD_PROFILE.jawWidth*.50,BJ_V10_HEAD_PROFILE.jawHeight*.68,BJ_V10_HEAD_PROFILE.jawDepth*.50)
  jawVolume.position.set(0,-.165,.035)
  geometryGroup.add(jawVolume)

  const chinVolume=new THREE.Mesh(new THREE.SphereGeometry(1,20,16),skinVolume)
  chinVolume.name='bj-v10-chin-volume'
  chinVolume.scale.set(.105,.085,.095)
  chinVolume.position.set(0,-.285,.205)
  geometryGroup.add(chinVolume)

  for(const side of [-1,1]){
    const cheek=new THREE.Mesh(new THREE.SphereGeometry(1,20,16),skinVolume)
    cheek.name=side<0?'bj-v10-cheek-left':'bj-v10-cheek-right'
    cheek.scale.set(.112,.088,.095)
    cheek.position.set(side*.142,-.040,.222)
    geometryGroup.add(cheek)

    const beardSide=new THREE.Mesh(new THREE.SphereGeometry(1,18,14),beardDark)
    beardSide.name=side<0?'bj-v10-beard-side-left':'bj-v10-beard-side-right'
    beardSide.scale.set(.112,.180,.092)
    beardSide.position.set(side*.112,-.220,.150)
    geometryGroup.add(beardSide)

    const graySide=new THREE.Mesh(new THREE.SphereGeometry(1,16,12),beardGray)
    graySide.name=side<0?'bj-v10-gray-beard-side-left':'bj-v10-gray-beard-side-right'
    graySide.scale.set(.072,.145,.068)
    graySide.position.set(side*.095,-.245,.205)
    geometryGroup.add(graySide)
  }

  const noseBridgeVolume=new THREE.Mesh(new THREE.CapsuleGeometry(.030,.115,5,12),skinVolume)
  noseBridgeVolume.name='bj-v10-nose-bridge-volume'
  noseBridgeVolume.position.set(0,.025,.332)
  noseBridgeVolume.rotation.x=.055
  geometryGroup.add(noseBridgeVolume)

  const noseTipVolume=new THREE.Mesh(new THREE.SphereGeometry(.055,20,14),skinVolume)
  noseTipVolume.name='bj-v10-nose-tip-volume'
  noseTipVolume.position.set(0,-.052,.383)
  noseTipVolume.scale.set(1.02,.70,.86)
  geometryGroup.add(noseTipVolume)

  const philtrumShadow=new THREE.Mesh(new THREE.CapsuleGeometry(.010,.045,3,8),skinShadow)
  philtrumShadow.name='bj-v10-philtrum-shadow'
  philtrumShadow.position.set(0,-.102,.354)
  geometryGroup.add(philtrumShadow)

  const lipMaterial=new THREE.MeshStandardMaterial({color:0x5a3028,roughness:.74,metalness:0})

  for(const side of [-1,1]){
    const temple=new THREE.Mesh(new THREE.SphereGeometry(1,18,14),skinVolume)
    temple.name=side<0?'bj-v10-temple-left':'bj-v10-temple-right'
    temple.scale.set(.070,.120,.075)
    temple.position.set(side*.245,.110,.110)
    geometryGroup.add(temple)

    const browRidge=new THREE.Mesh(new THREE.CapsuleGeometry(.014,.092,3,10),skinVolume)
    browRidge.name=side<0?'bj-v10-brow-ridge-left':'bj-v10-brow-ridge-right'
    browRidge.rotation.z=Math.PI/2+(side<0?.08:-.08)
    browRidge.position.set(side*.105,.095,.330)
    geometryGroup.add(browRidge)

    const orbitShadow=new THREE.Mesh(new THREE.SphereGeometry(1,18,12),skinShadow)
    orbitShadow.name=side<0?'bj-v10-orbit-left':'bj-v10-orbit-right'
    orbitShadow.scale.set(.080,.050,.035)
    orbitShadow.position.set(side*.102,.045,.315)
    geometryGroup.add(orbitShadow)
  }

  const upperLipVolume=new THREE.Mesh(new THREE.CapsuleGeometry(.014,.105,3,10),lipMaterial)
  upperLipVolume.name='bj-v10-upper-lip-volume'
  upperLipVolume.rotation.z=Math.PI/2
  upperLipVolume.position.set(0,-.133,.347)
  upperLipVolume.scale.y=.80
  geometryGroup.add(upperLipVolume)

  const lowerLipVolume=new THREE.Mesh(new THREE.CapsuleGeometry(.016,.112,3,10),lipMaterial)
  lowerLipVolume.name='bj-v10-lower-lip-volume'
  lowerLipVolume.rotation.z=Math.PI/2
  lowerLipVolume.position.set(0,-.164,.351)
  lowerLipVolume.scale.y=.86
  geometryGroup.add(lowerLipVolume)

  const mouthCornerShadow=new THREE.Mesh(new THREE.CapsuleGeometry(.006,.135,2,8),skinShadow)
  mouthCornerShadow.name='bj-v10-mouth-line'
  mouthCornerShadow.rotation.z=Math.PI/2
  mouthCornerShadow.position.set(0,-.151,.342)
  geometryGroup.add(mouthCornerShadow)

  const beardChinVolume=new THREE.Mesh(new THREE.SphereGeometry(1,20,16),beardGray)
  beardChinVolume.name='bj-v10-beard-chin-volume'
  beardChinVolume.scale.set(.132,.180,.105)
  beardChinVolume.position.set(0,-.285,.170)
  geometryGroup.add(beardChinVolume)

  const beardLowerVolume=new THREE.Mesh(new THREE.SphereGeometry(1,20,16),beardGray)
  beardLowerVolume.name='bj-v10-beard-lower-volume'
  beardLowerVolume.scale.set(.115,.170,.092)
  beardLowerVolume.position.set(0,-.390,.135)
  geometryGroup.add(beardLowerVolume)

  headPivot.add(geometryGroup)
  headPivot.add(mesh)

  const hidden:Array<{object:THREE.Object3D;visible:boolean}>=[]
  let disposed=false
  const ready=new Promise<boolean>(resolve=>{
    new THREE.TextureLoader().load(
      BJ_PHOTOMATCH_TEXTURE_DATA_URI,
      texture=>{
        if(disposed){texture.dispose();resolve(false);return}
        texture.colorSpace=THREE.SRGBColorSpace
        texture.anisotropy=4
        const feathered=featherPhotoTexture(texture)
        material.map=feathered
        material.emissiveMap=feathered
        material.opacity=1
        material.needsUpdate=true
        if(feathered!==texture)texture.dispose()
        hero.traverse(object=>{
          if(object===mesh||!PROCEDURAL_FACE_PARTS.has(object.name))return
          hidden.push({object,visible:object.visible})
          object.visible=false
        })
        hero.userData={...hero.userData,photoMatchedHeadActive:true,photoMatchedAssetId:BJ_PHOTOMATCH_ASSET.id,photoReferenceTextureAuthority:true,volumetricHeadV10:true,facialLandmarksV10:true,headProfileVersion:BJ_V10_HEAD_PROFILE.version,headDetailProfile:BJ_V13_HEAD_DETAIL_PROFILE.version,facialDepthPass:'bj-v13-brow-orbit-lip-jaw'}
        window.dispatchEvent(new CustomEvent('tryamm:bj-photomatched-head-ready',{detail:{characterId:'bj-stubbs',assetId:BJ_PHOTOMATCH_ASSET.id,active3DMesh:true,approvedReferencePixels:true,frontFacingReference:true,featheredPhotoBlend:true,proceduralFaceHidden:true,volumetricHeadV10:true,facialLandmarksV10:true,profileGeometry:true,profileVersion:BJ_V10_HEAD_PROFILE.version,headDetailProfile:BJ_V13_HEAD_DETAIL_PROFILE.version,facialDepthPass:'bj-v13-brow-orbit-lip-jaw',certifiedLikeness:false}}))
        resolve(true)
      },
      undefined,
      ()=>{
        mesh.removeFromParent()
        geometryGroup.removeFromParent()
        geometry.dispose()
        geometryGroup.traverse(object=>{
          if(object instanceof THREE.Mesh)object.geometry.dispose()
        })
        for(const mat of [skinVolume,skinShadow,beardDark,beardGray,lipMaterial])mat.dispose()
        material.dispose()
        window.dispatchEvent(new CustomEvent('tryamm:bj-photomatched-head-fallback',{detail:{characterId:'bj-stubbs',assetId:BJ_PHOTOMATCH_ASSET.id,proceduralFallback:true}}))
        resolve(false)
      }
    )
  })

  return {
    mesh,
    geometryGroup,
    ready,
    dispose:()=>{
      disposed=true
      hidden.forEach(entry=>{entry.object.visible=entry.visible})
      mesh.removeFromParent()
      geometryGroup.removeFromParent()
      material.map?.dispose()
      material.dispose()
      geometry.dispose()
      geometryGroup.traverse(object=>{
        if(object instanceof THREE.Mesh)object.geometry.dispose()
      })
      for(const mat of [skinVolume,skinShadow,beardDark,beardGray,lipMaterial])mat.dispose()
    },
  }
}
