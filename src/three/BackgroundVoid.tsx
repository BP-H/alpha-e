return (
  <div className="r3f-root" aria-hidden>
    <Canvas dpr={[1, 2]} camera={{ position: [0, 0.2, 7], fov: 50 }}>
      <color attach="background" args={[bg]} />
      <fog attach="fog" args={[fogC, fogNear, fogFar]} />
      <ambientLight intensity={1.0} />
      <directionalLight position={[5, 8, 3]} intensity={0.65} />
      <FloorGrid color={gridC} opacity={w.gridOpacity} />
      <Instances limit={64}>
        <sphereGeometry args={[0.26, 32, 32]} />
        <meshStandardMaterial
          color={w.orbColor}
          emissive={w.theme === "dark" ? "#6b72ff" : "#b6bcff"}
          emissiveIntensity={0.16}
          roughness={0.25}
          metalness={0.55}
        />
        {positions.map((p, i) => (
          <Float
            key={p.join(",")}
            floatIntensity={0.6}
            rotationIntensity={0.25}
            speed={0.9 + (i % 4) * 0.15}
          >
            <Instance position={p} />
          </Float>
        ))}
      </Instances>
    </Canvas>
  </div>
);
