# Blender (bpy) фон для сцены «стол, конверт, открытая дверь». Запуск: /tmp/bpy-venv/bin/python kv_table.py <out.png>
import bpy, math, sys
out=sys.argv[-1]
bpy.ops.wm.read_factory_settings(use_empty=True)
sc=bpy.context.scene
sc.render.engine='CYCLES'; sc.cycles.device='CPU'; sc.cycles.samples=48; sc.cycles.use_denoising=True
sc.render.resolution_x=1080; sc.render.resolution_y=1920
sc.view_settings.view_transform='Standard'; sc.view_settings.look='None'
sc.render.use_freestyle=True; sc.render.line_thickness=1.2
vl=sc.view_layers[0]; vl.use_freestyle=True
ls=vl.freestyle_settings.linesets.new('ink'); ls.select_silhouette=True; ls.select_border=True; ls.select_crease=True
ls.linestyle.color=(0.2,0.14,0.1); ls.linestyle.thickness=3.0
def mat(name,col,emit=0):
    m=bpy.data.materials.new(name); m.use_nodes=True
    b=m.node_tree.nodes['Principled BSDF']; b.inputs['Base Color'].default_value=(*col,1); b.inputs['Roughness'].default_value=1
    if emit:
        b.inputs['Emission Color'].default_value=(*col,1); b.inputs['Emission Strength'].default_value=emit
    return m
def box(name,loc,size,col,emit=0,rot=0):
    bpy.ops.mesh.primitive_cube_add(location=loc); o=bpy.context.object; o.name=name; o.scale=size; o.rotation_euler[2]=math.radians(rot); o.data.materials.append(mat(name,col,emit)); return o
box('floor',(0,0,-0.05),(6,6,0.05),(0.50,0.32,0.26))
box('wall',(0,3,2),(6,0.05,2),(0.80,0.74,0.58))
box('wall_l',(-3.2,0,2),(0.05,6,2),(0.72,0.66,0.52))
box('skirt',(0,2.93,0.12),(6,0.03,0.12),(0.45,0.32,0.22))
box('table',(0,0,0.7),(1.6,0.9,0.05),(0.66,0.46,0.3))
box('apron',(0,-0.82,0.6),(1.55,0.04,0.08),(0.55,0.38,0.25))
for x,y in [(-1.5,-0.8),(1.5,-0.8),(-1.5,0.8),(1.5,0.8)]: box('leg',(x*0.95,y*0.9,0.35),(0.06,0.06,0.35),(0.5,0.34,0.24))
# открытая дверь с тёплым светом
box('doorlight',(1.0,2.9,1.05),(0.5,0.01,1.05),(1.0,0.84,0.48),emit=1.0)
box('doorjamb',(1.0,2.88,1.05),(0.56,0.03,1.12),(0.4,0.28,0.18))
bpy.ops.object.light_add(type='AREA',location=(1.0,2.3,1.3)); a=bpy.context.object; a.data.energy=70; a.data.color=(1,0.8,0.45); a.data.size=1.2; a.rotation_euler[0]=math.radians(90)
# лампа
bpy.ops.object.light_add(type='POINT',location=(-0.4,-0.8,2.0)); l=bpy.context.object; l.data.energy=45; l.data.color=(1,0.8,0.55)
w=bpy.data.worlds.new('w'); sc.world=w; w.use_nodes=True; w.node_tree.nodes['Background'].inputs[0].default_value=(0.5,0.46,0.4,1); w.node_tree.nodes['Background'].inputs[1].default_value=0.18
bpy.ops.object.camera_add(location=(0.1,-2.9,2.6)); c=bpy.context.object; sc.camera=c
c.rotation_euler=(math.radians(66),0,0); c.data.lens=34
sc.render.filepath=out; bpy.ops.render.render(write_still=True); print('done')
