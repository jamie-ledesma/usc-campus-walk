#!/bin/bash
set -e
cd "$(dirname "$0")"
cat head.html > game.html
echo '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>' >> game.html
echo '<script id="osmdata" type="text/plain">' >> game.html
cat world.txt >> game.html
echo '</script>' >> game.html
echo '<script>' >> game.html
cat a_world.js a2_coliseum.js a2b_assoc.js a2c_rose.js a2d_nhm.js a2e_sci.js a2f_courts.js a2g_metro.js a2h_fence.js a2i_halls.js a2n_dmc.js a2k_alumni.js a2l_road.js a2p_pardee.js a2m_hahn.js a2j_bounds.js a2o_lewis.js a2q_widney.js a2r_tcc.js a2s_union.js a2t_hammock.js a2u_galen.js a2v_leavey.js a2x_bovard.js a2w_felix.js a2y_shrine.js a2z_shrinesite.js a2za_rawlinson.js a2zb_hancock.js a2zc_moreton.js a2zd_gould.js a2ze_birnkrant.js a2zf_tailgate.js a3_landscape.js a4_city.js a4b_skyline.js b_play.js b2_band.js e_crowd.js c_main.js d_loop.js > all.js
node --check all.js
cat all.js >> game.html
echo '</script>' >> game.html
sed -e 's#<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>#<script src="three.local.js"></script>#' -e '/fonts.googleapis.com|fonts.gstatic.com/d' game.html > test.html
echo "built $(wc -c < game.html) bytes"
