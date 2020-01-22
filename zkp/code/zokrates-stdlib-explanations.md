# sha256() vs sha256compression()

We consider some examples to see the differences in the hashing functions provided by ZoKrates.

## Summary

For a binary message `M` of bit length `l`, denote `I` as the entire 512bit binary input to the sha
function, and denote `O` as the output. Let `K` be the 'padding string' for sha256; a single `1`
followed by `k` zeroes. I.e. `K = 1 0 0 0 ... 0 0 0` is of total length `k+1`. Let `P` be a padding
string of all zeroes, of length `p`. Let `Z` be a 64bit binary representation of the value `l`. `|`
is a concatenation symbol.

**sha256compression()** `sha256compression(I) = O` where: `I = M | K | Z` for `l <= 447` and
`l + k + 1 = 448`. So the message length is restricted to 447bits, and the length of the input `I`
_must_ be exactly 512bits. I.e. sha256compression expects a 512bit binary input which _already
contains_ sha-compliant padding. Hence, this is only useful for hashing messages which are strictly
_smaller_ in bit-length than 448bits. If your message `M` is indeed strictly smaller than 448bits,
then this function is much more efficient to use than sha256(). Note that you will need to pad `M`
with `K` and `Z` yourself.

**To calculate `sha256compression( M | K | Z )` in zokrates is equivalent to calculating
`sha256(abi.encodePacked( M ))` in Solidity.**

sha256() `sha256(I) = O` where: `I = M` and `M` is of length `l = 512` exactly. The sha256()
function seems to assume that your entire input is the 512bit message. If you want to send a message
`M'` to sha256() which has bit-length `l' < 512`, you will need to create custom (non-standard)
padding `P`, where `p + l' = 512`, and pass an input `I' = P | M'` (or indeed you can pass any other
permutation of padding, given that this is 'custom-padding' - as long as you keep track of how
you've padded your message!)

**So to calculate `sha256(M)` in zokrates is equivalent to calculating `sha256(abi.encodePacked(M))`
in Solidity.**

**To calculate `sha256( M' | P )` in zokrates is equivalent to calculating
`sha256(abi.encodePacked( M' | P ))` in Solidity.**

**Note:**

_All solidity test code implemented in Remix as follows:_

```solidity
pragma solidity ^0.5.8;
import "remix_tests.sol"; // this import is automatically injected by Remix.
contract test {
  bytes input = hex'ffff';
  bytes32 output;
  function shaIt() public returns (bytes32) {
    output = sha256(abi.encodePacked(input));
    return output;
  }
}
```

_Only the value of `input` was changed for each example._

**Note:**

_All zokrates test code implemented as follows:  
For sha256() :_

```
import "LIBSNARK/sha256compression"
import "LIBSNARK/sha256"

def main(field  a511, field  a510, field  a509, field  a508, field  a507, field  a506, field  a505, field  a504, field  a503, field  a502, field  a501, field  a500, field  a499, field  a498, field  a497, field  a496, field  a495, field  a494, field  a493, field  a492, field  a491, field  a490, field  a489, field  a488, field  a487, field  a486, field  a485, field  a484, field  a483, field  a482, field  a481, field  a480, field  a479, field  a478, field  a477, field  a476, field  a475, field  a474, field  a473, field  a472, field  a471, field  a470, field  a469, field  a468, field  a467, field  a466, field  a465, field  a464, field  a463, field  a462, field  a461, field  a460, field  a459, field  a458, field  a457, field  a456, field  a455, field  a454, field  a453, field  a452, field  a451, field  a450, field  a449, field  a448, field  a447, field  a446, field  a445, field  a444, field  a443, field  a442, field  a441, field  a440, field  a439, field  a438, field  a437, field  a436, field  a435, field  a434, field  a433, field  a432, field  a431, field  a430, field  a429, field  a428, field  a427, field  a426, field  a425, field  a424, field  a423, field  a422, field  a421, field  a420, field  a419, field  a418, field  a417, field  a416, field  a415, field  a414, field  a413, field  a412, field  a411, field  a410, field  a409, field  a408, field  a407, field  a406, field  a405, field  a404, field  a403, field  a402, field  a401, field  a400, field  a399, field  a398, field  a397, field  a396, field  a395, field  a394, field  a393, field  a392, field  a391, field  a390, field  a389, field  a388, field  a387, field  a386, field  a385, field  a384, field  a383, field  a382, field  a381, field  a380, field  a379, field  a378, field  a377, field  a376, field  a375, field  a374, field  a373, field  a372, field  a371, field  a370, field  a369, field  a368, field  a367, field  a366, field  a365, field  a364, field  a363, field  a362, field  a361, field  a360, field  a359, field  a358, field  a357, field  a356, field  a355, field  a354, field  a353, field  a352, field  a351, field  a350, field  a349, field  a348, field  a347, field  a346, field  a345, field  a344, field  a343, field  a342, field  a341, field  a340, field  a339, field  a338, field  a337, field  a336, field  a335, field  a334, field  a333, field  a332, field  a331, field  a330, field  a329, field  a328, field  a327, field  a326, field  a325, field  a324, field  a323, field  a322, field  a321, field  a320, field  a319, field  a318, field  a317, field  a316, field  a315, field  a314, field  a313, field  a312, field  a311, field  a310, field  a309, field  a308, field  a307, field  a306, field  a305, field  a304, field  a303, field  a302, field  a301, field  a300, field  a299, field  a298, field  a297, field  a296, field  a295, field  a294, field  a293, field  a292, field  a291, field  a290, field  a289, field  a288, field  a287, field  a286, field  a285, field  a284, field  a283, field  a282, field  a281, field  a280, field  a279, field  a278, field  a277, field  a276, field  a275, field  a274, field  a273, field  a272, field  a271, field  a270, field  a269, field  a268, field  a267, field  a266, field  a265, field  a264, field  a263, field  a262, field  a261, field  a260, field  a259, field  a258, field  a257, field  a256, field  a255, field  a254, field  a253, field  a252, field  a251, field  a250, field  a249, field  a248, field  a247, field  a246, field  a245, field  a244, field  a243, field  a242, field  a241, field  a240, field  a239, field  a238, field  a237, field  a236, field  a235, field  a234, field  a233, field  a232, field  a231, field  a230, field  a229, field  a228, field  a227, field  a226, field  a225, field  a224, field  a223, field  a222, field  a221, field  a220, field  a219, field  a218, field  a217, field  a216, field  a215, field  a214, field  a213, field  a212, field  a211, field  a210, field  a209, field  a208, field  a207, field  a206, field  a205, field  a204, field  a203, field  a202, field  a201, field  a200, field  a199, field  a198, field  a197, field  a196, field  a195, field  a194, field  a193, field  a192, field  a191, field  a190, field  a189, field  a188, field  a187, field  a186, field  a185, field  a184, field  a183, field  a182, field  a181, field  a180, field  a179, field  a178, field  a177, field  a176, field  a175, field  a174, field  a173, field  a172, field  a171, field  a170, field  a169, field  a168, field  a167, field  a166, field  a165, field  a164, field  a163, field  a162, field  a161, field  a160, field  a159, field  a158, field  a157, field  a156, field  a155, field  a154, field  a153, field  a152, field  a151, field  a150, field  a149, field  a148, field  a147, field  a146, field  a145, field  a144, field  a143, field  a142, field  a141, field  a140, field  a139, field  a138, field  a137, field  a136, field  a135, field  a134, field  a133, field  a132, field  a131, field  a130, field  a129, field  a128, field  a127, field  a126, field  a125, field  a124, field  a123, field  a122, field  a121, field  a120, field  a119, field  a118, field  a117, field  a116, field  a115, field  a114, field  a113, field  a112, field  a111, field  a110, field  a109, field  a108, field  a107, field  a106, field  a105, field  a104, field  a103, field  a102, field  a101, field  a100, field  a99, field  a98, field  a97, field  a96, field  a95, field  a94, field  a93, field  a92, field  a91, field  a90, field  a89, field  a88, field  a87, field  a86, field  a85, field  a84, field  a83, field  a82, field  a81, field  a80, field  a79, field  a78, field  a77, field  a76, field  a75, field  a74, field  a73, field  a72, field  a71, field  a70, field  a69, field  a68, field  a67, field  a66, field  a65, field  a64, field  a63, field  a62, field  a61, field  a60, field  a59, field  a58, field  a57, field  a56, field  a55, field  a54, field  a53, field  a52, field  a51, field  a50, field  a49, field  a48, field  a47, field  a46, field  a45, field  a44, field  a43, field  a42, field  a41, field  a40, field  a39, field  a38, field  a37, field  a36, field  a35, field  a34, field  a33, field  a32, field  a31, field  a30, field  a29, field  a28, field  a27, field  a26, field  a25, field  a24, field  a23, field  a22, field  a21, field  a20, field  a19, field  a18, field  a17, field  a16, field  a15, field  a14, field  a13, field  a12, field  a11, field  a10, field  a9, field  a8, field  a7, field  a6, field  a5, field  a4, field  a3, field  a2, field  a1, field  a0)->(field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field, field):


  t255, t254, t253, t252, t251, t250, t249, t248, t247, t246, t245, t244, t243, t242, t241, t240, t239, t238, t237, t236, t235, t234, t233, t232, t231, t230, t229, t228, t227, t226, t225, t224, t223, t222, t221, t220, t219, t218, t217, t216, t215, t214, t213, t212, t211, t210, t209, t208, t207, t206, t205, t204, t203, t202, t201, t200, t199, t198, t197, t196, t195, t194, t193, t192, t191, t190, t189, t188, t187, t186, t185, t184, t183, t182, t181, t180, t179, t178, t177, t176, t175, t174, t173, t172, t171, t170, t169, t168, t167, t166, t165, t164, t163, t162, t161, t160, t159, t158, t157, t156, t155, t154, t153, t152, t151, t150, t149, t148, t147, t146, t145, t144, t143, t142, t141, t140, t139, t138, t137, t136, t135, t134, t133, t132, t131, t130, t129, t128, t127, t126, t125, t124, t123, t122, t121, t120, t119, t118, t117, t116, t115, t114, t113, t112, t111, t110, t109, t108, t107, t106, t105, t104, t103, t102, t101, t100, t99, t98, t97, t96, t95, t94, t93, t92, t91, t90, t89, t88, t87, t86, t85, t84, t83, t82, t81, t80, t79, t78, t77, t76, t75, t74, t73, t72, t71, t70, t69, t68, t67, t66, t65, t64, t63, t62, t61, t60, t59, t58, t57, t56, t55, t54, t53, t52, t51, t50, t49, t48, t47, t46, t45, t44, t43, t42, t41, t40, t39, t38, t37, t36, t35, t34, t33, t32, t31, t30, t29, t28, t27, t26, t25, t24, t23, t22, t21, t20, t19, t18, t17, t16, t15, t14, t13, t12, t11, t10, t9, t8, t7, t6, t5, t4, t3, t2, t1, t0 = sha256(a511, a510, a509, a508, a507, a506, a505, a504, a503, a502, a501, a500, a499, a498, a497, a496, a495, a494, a493, a492, a491, a490, a489, a488, a487, a486, a485, a484, a483, a482, a481, a480, a479, a478, a477, a476, a475, a474, a473, a472, a471, a470, a469, a468, a467, a466, a465, a464, a463, a462, a461, a460, a459, a458, a457, a456, a455, a454, a453, a452, a451, a450, a449, a448, a447, a446, a445, a444, a443, a442, a441, a440, a439, a438, a437, a436, a435, a434, a433, a432, a431, a430, a429, a428, a427, a426, a425, a424, a423, a422, a421, a420, a419, a418, a417, a416, a415, a414, a413, a412, a411, a410, a409, a408, a407, a406, a405, a404, a403, a402, a401, a400, a399, a398, a397, a396, a395, a394, a393, a392, a391, a390, a389, a388, a387, a386, a385, a384, a383, a382, a381, a380, a379, a378, a377, a376, a375, a374, a373, a372, a371, a370, a369, a368, a367, a366, a365, a364, a363, a362, a361, a360, a359, a358, a357, a356, a355, a354, a353, a352, a351, a350, a349, a348, a347, a346, a345, a344, a343, a342, a341, a340, a339, a338, a337, a336, a335, a334, a333, a332, a331, a330, a329, a328, a327, a326, a325, a324, a323, a322, a321, a320, a319, a318, a317, a316, a315, a314, a313, a312, a311, a310, a309, a308, a307, a306, a305, a304, a303, a302, a301, a300, a299, a298, a297, a296, a295, a294, a293, a292, a291, a290, a289, a288, a287, a286, a285, a284, a283, a282, a281, a280, a279, a278, a277, a276, a275, a274, a273, a272, a271, a270, a269, a268, a267, a266, a265, a264, a263, a262, a261, a260, a259, a258, a257, a256, a255, a254, a253, a252, a251, a250, a249, a248, a247, a246, a245, a244, a243, a242, a241, a240, a239, a238, a237, a236, a235, a234, a233, a232, a231, a230, a229, a228, a227, a226, a225, a224, a223, a222, a221, a220, a219, a218, a217, a216, a215, a214, a213, a212, a211, a210, a209, a208, a207, a206, a205, a204, a203, a202, a201, a200, a199, a198, a197, a196, a195, a194, a193, a192, a191, a190, a189, a188, a187, a186, a185, a184, a183, a182, a181, a180, a179, a178, a177, a176, a175, a174, a173, a172, a171, a170, a169, a168, a167, a166, a165, a164, a163, a162, a161, a160, a159, a158, a157, a156, a155, a154, a153, a152, a151, a150, a149, a148, a147, a146, a145, a144, a143, a142, a141, a140, a139, a138, a137, a136, a135, a134, a133, a132, a131, a130, a129, a128, a127, a126, a125, a124, a123, a122, a121, a120, a119, a118, a117, a116, a115, a114, a113, a112, a111, a110, a109, a108, a107, a106, a105, a104, a103, a102, a101, a100, a99, a98, a97, a96, a95, a94, a93, a92, a91, a90, a89, a88, a87, a86, a85, a84, a83, a82, a81, a80, a79, a78, a77, a76, a75, a74, a73, a72, a71, a70, a69, a68, a67, a66, a65, a64, a63, a62, a61, a60, a59, a58, a57, a56, a55, a54, a53, a52, a51, a50, a49, a48, a47, a46, a45, a44, a43, a42, a41, a40, a39, a38, a37, a36, a35, a34, a33, a32, a31, a30, a29, a28, a27, a26, a25, a24, a23, a22, a21, a20, a19, a18, a17, a16, a15, a14, a13, a12, a11, a10, a9, a8, a7, a6, a5, a4, a3, a2, a1, a0)

  return t255, t254, t253, t252, t251, t250, t249, t248, t247, t246, t245, t244, t243, t242, t241, t240, t239, t238, t237, t236, t235, t234, t233, t232, t231, t230, t229, t228, t227, t226, t225, t224, t223, t222, t221, t220, t219, t218, t217, t216, t215, t214, t213, t212, t211, t210, t209, t208, t207, t206, t205, t204, t203, t202, t201, t200, t199, t198, t197, t196, t195, t194, t193, t192, t191, t190, t189, t188, t187, t186, t185, t184, t183, t182, t181, t180, t179, t178, t177, t176, t175, t174, t173, t172, t171, t170, t169, t168, t167, t166, t165, t164, t163, t162, t161, t160, t159, t158, t157, t156, t155, t154, t153, t152, t151, t150, t149, t148, t147, t146, t145, t144, t143, t142, t141, t140, t139, t138, t137, t136, t135, t134, t133, t132, t131, t130, t129, t128, t127, t126, t125, t124, t123, t122, t121, t120, t119, t118, t117, t116, t115, t114, t113, t112, t111, t110, t109, t108, t107, t106, t105, t104, t103, t102, t101, t100, t99, t98, t97, t96, t95, t94, t93, t92, t91, t90, t89, t88, t87, t86, t85, t84, t83, t82, t81, t80, t79, t78, t77, t76, t75, t74, t73, t72, t71, t70, t69, t68, t67, t66, t65, t64, t63, t62, t61, t60, t59, t58, t57, t56, t55, t54, t53, t52, t51, t50, t49, t48, t47, t46, t45, t44, t43, t42, t41, t40, t39, t38, t37, t36, t35, t34, t33, t32, t31, t30, t29, t28, t27, t26, t25, t24, t23, t22, t21, t20, t19, t18, t17, t16, t15, t14, t13, t12, t11, t10, t9, t8, t7, t6, t5, t4, t3, t2, t1, t0
```

_For sha256compression():_ As above but replacing the `sha256()` with `sha256compression()`

_For each example, a binary witness was passed to the main() function through:_
`./zokrates compute-witness -a <512bit space-separated binary string>`

_For each example, the binary output from the zokrates console has been converted to hexadecimal by
me 'behind the scenes', to make visual comparisons easier for us when reading this document._

## Example 1

128octets: (128 hexadecimal `f`s)
`ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff`

[Online](http://extranet.cryptomathic.com/hashcalc/index) sha256 of this hexadecimal value:
`8667e718294e9e0df1d30600ba3eeb201f764aad2dad72748643e4a285e1d1f7`

Solidity sha256 of this: `8667e718294e9e0df1d30600ba3eeb201f764aad2dad72748643e4a285e1d1f7`

Now let's look at how ZoKrates computes sha256 hashes of the binary representation of the above
number.

512bit binary representation of the octets:
`1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1`

zokrates sha256() of this binary value:
`8667e718294e9e0df1d30600ba3eeb201f764aad2dad72748643e4a285e1d1f7` (match) zokrates
sha256compression() of this binary value:
`ef0c748df4da50a8d6c43c013edc3ce76c9d9fa9a1458ade56eb86c0a64492d2`

## Example 2

**2octets**: `00` (left-padded with 126 `0`s)
`00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000`

[Online](http://extranet.cryptomathic.com/hashcalc/index) sha256 of this hexadecimal value:
`f5a5fd42d16a20302798ef6ed309979b43003d2320d9f0e8ea9831a92759fb4b`

solidity sha256 of this: `f5a5fd42d16a20302798ef6ed309979b43003d2320d9f0e8ea9831a92759fb4b`

**2octets**: `00` (padded according to the NIST specification of sha256)
`00800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008`

[Online](http://extranet.cryptomathic.com/hashcalc/index) sha256 of this hexadecimal value:
`31fb5dd29ffbf07a121e8d3de826ee738db0e5f6dedcdfa6b6abaf2658b07f08`

solidity sha256 of this: `31fb5dd29ffbf07a121e8d3de826ee738db0e5f6dedcdfa6b6abaf2658b07f08`

**2octets**: `00` (standalone, without padding)

[Online](http://extranet.cryptomathic.com/hashcalc/index) sha256 of this hexadecimal value:
`6e340b9cffb37a989ca544e6bb780a2c78901d3fb33738768511a30617afa01d`

solidity sha256 of this: `6e340b9cffb37a989ca544e6bb780a2c78901d3fb33738768511a30617afa01d`

Now let's look at how ZoKrates computes sha256 hashes of the binary representation of the above
number.

**512bit binary representations of the octets**:

The binary number `0000 0000` (left-padded with 504 `0`s):
`0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0`

zokrates sha256() of this binary value:
`f5a5fd42d16a20302798ef6ed309979b43003d2320d9f0e8ea9831a92759fb4b` (match) zokrates
sha256compression() of this binary value:
`da5698be17b9b46962335799779fbeca8ce5d491c0d26243bafef9ea1837a9d8`

The binary number `0000 0000` (padded according to the NIST specification of sha256):
`0 0 0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0`

zokrates sha256() of this binary value:
`31fb5dd29ffbf07a121e8d3de826ee738db0e5f6dedcdfa6b6abaf2658b07f08` (match) zokrates
sha256compression() of this binary value:
`6e340b9cffb37a989ca544e6bb780a2c78901d3fb33738768511a30617afa01d` (match)

## Example 3

**4octets** `ffff` (hex) = 1111111111111111 (binary - 16 bits)

**4octets** `ffff` (left-padded with 124 `0`s)
`0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000ffff`

[Online](http://extranet.cryptomathic.com/hashcalc/index) sha256 of this hexadecimal value:
`c35998086890f9aee698227af0969f525b5b2d02f2e3ddbdb736b437ef0c8c18` solidity sha256 of this:
`c35998086890f9aee698227af0969f525b5b2d02f2e3ddbdb736b437ef0c8c18`

**4octets** `ffff`(padded according to the NIST specification of sha256)
`ffff8000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010`

[Online](http://extranet.cryptomathic.com/hashcalc/index) sha256 of this hexadecimal value:  
`92ce0255f5b4af1711707a4196b1830551650c62af092ef05721e2475dfe36db` solidity sha256 of this:
`92ce0255f5b4af1711707a4196b1830551650c62af092ef05721e2475dfe36db`

**4octets** `ffff`(no padding) `ffff`

[Online](http://extranet.cryptomathic.com/hashcalc/index) sha256 of this hexadecimal value:
`ca2fd00fa001190744c15c317643ab092e7048ce086a243e2be9437c898de1bb`

solidity sha256 of this: `ca2fd00fa001190744c15c317643ab092e7048ce086a243e2be9437c898de1bb`

Now let's look at how ZoKrates computes sha256 hashes of the binary representation of the above
number.

**512bit binary representations of the octets**:

The binary number `1111 1111 1111 1111` (left-padded with 496 `0`s):
`0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1`

zokrates sha256() of this binary value:
`c35998086890f9aee698227af0969f525b5b2d02f2e3ddbdb736b437ef0c8c18` (match) zokrates
sha256compression() of this binary value:
`f7b4f62a9b2fd48aa7e0b322aa1c8af3c2baab2657ef4146cd2a6d645af41a75`

The binary number `1111 1111 1111 1111` (padded according to the NIST specification of sha256):
`1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0`

zokrates sha256() of this binary value:
`92ce0255f5b4af1711707a4196b1830551650c62af092ef05721e2475dfe36db` (match) zokrates
sha256compression() of this binary value:
`ca2fd00fa001190744c15c317643ab092e7048ce086a243e2be9437c898de1bb` (match)
